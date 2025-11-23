
import { GoogleGenAI, Modality, Type, GenerateContentResponse, VideosOperation } from "@google/genai";
import type { GenerationConfig, GeneratedImage, ProductType, PosterConfig, VideoConfig, UGCVideoConfig, UGCSoundVideoConfig, UGCAffiliateConfig, InteractiveAnimationConfig, InteractiveAnimationScene } from '../types';
import { 
    SYSTEM_PROMPT_TEMPLATE, 
    PORTRAIT_SYSTEM_PROMPT_TEMPLATE,
    PORTRAIT_WITH_PRODUCT_SYSTEM_PROMPT_TEMPLATE,
    POSTER_SYSTEM_PROMPT_TEMPLATE,
    POSTER_ASSISTANT_SYSTEM_PROMPT_TEMPLATE,
    POSTER_INITIAL_TEXT_SYSTEM_PROMPT_TEMPLATE,
    UGC_VIDEO_PROMPT_SYSTEM_PROMPT,
    UGC_HOOK_TEXT_SYSTEM_PROMPT,
    UGC_PRODUCT_ANALYSIS_PROMPT_TEMPLATE,
    UGC_SOUND_VIDEO_PROMPT_TEMPLATE,
    UGC_AFFILIATE_ASSETS_PROMPT_TEMPLATE,
    UGC_AFFILIATE_REGENERATE_IMAGE_PROMPT_TEMPLATE,
    UGC_AFFILIATE_VIDEO_FROM_IMAGE_PROMPT_TEMPLATE,
    INTERACTIVE_ANIMATION_PLAN_PROMPT_TEMPLATE,
    INTERACTIVE_ANIMATION_FRAME_PROMPT_TEMPLATE,
    INTERACTIVE_ANIMATION_FULL_VIDEO_PROMPT_TEMPLATE,
    OTHER_OPTION,
    ALL_PRODUCT_TYPES,
    optionsByCategory,
    getProductCategory,
    POSTER_THEMES,
    COLOR_PALETTES,
    FONT_STYLES,
} from '../constants';


// --- Utility Functions ---

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const base64ToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
        inlineData: { data: base64Data, mimeType },
    };
};

const sanitizeJson = (text: string) => {
    // Look for the first and last curly brace or square bracket to extract the JSON object/array
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && lastBrace !== -1) {
        if (firstBracket !== -1 && firstBracket < firstBrace) {
            start = firstBracket;
            end = lastBracket;
        } else {
            start = firstBrace;
            end = lastBrace;
        }
    } else if (firstBracket !== -1 && lastBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
    }
    
    if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1);
    }
    
    // Fallback for simple cases
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// --- API Functions ---

export const identifyProductFromImage = async (file: File, apiKey: string): Promise<{ productName: string, photoType: ProductType }> => {
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(file);

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    imagePart,
                    { text: `Analyze this product image. Identify the product name and classify it into one of these types: ${ALL_PRODUCT_TYPES.map(p => p.id).join(', ')}. Return a JSON object with "productName" and "photoType".` }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING },
                        photoType: { type: Type.STRING }
                    }
                }
            }
        });

        const resultText = sanitizeJson(response.text);
        return JSON.parse(resultText);
    });
};

export const generatePhotography = async (sourceImage: File, portraitProductImage: File | null, config: GenerationConfig, activeView: 'marketing' | 'food' | 'portrait', numberOfResults: number, apiKey: string | null): Promise<GeneratedImage[]> => {
    if (!apiKey) throw new Error("API Key is missing for photography generation.");
    const ai = new GoogleGenAI({ apiKey });
    const sourceImagePart = await fileToGenerativePart(sourceImage);
    const parts: any[] = [sourceImagePart];

    let systemPrompt: string;
    if (activeView === 'portrait' && portraitProductImage) {
        systemPrompt = PORTRAIT_WITH_PRODUCT_SYSTEM_PROMPT_TEMPLATE;
        parts.push(await fileToGenerativePart(portraitProductImage));
    } else if (activeView === 'portrait') {
        systemPrompt = PORTRAIT_SYSTEM_PROMPT_TEMPLATE;
    } else {
        systemPrompt = SYSTEM_PROMPT_TEMPLATE;
    }

    const { photoType, productName, angleStyle, lightingStyle, stylingStyle, outfitStyle, backgroundStyle, customBackgroundStyle, extraInstructions, withWatermark, customWatermarkText } = config;
    
    const productTypeInfo = ALL_PRODUCT_TYPES.find(p => p.id === photoType);
    const category = getProductCategory(photoType);
    const options = optionsByCategory[category];
    
    const getOptionName = (id: string, optionList: { id: string, name_en: string }[]) => optionList.find(o => o.id === id)?.name_en || id;

    const finalBackgroundStyle = backgroundStyle === OTHER_OPTION.id ? customBackgroundStyle : getOptionName(backgroundStyle, options.backgrounds);

    const filledPrompt = systemPrompt
        .replace('{{product_description}}', `${productName || ''} (${productTypeInfo?.name_en || photoType})`)
        .replace('{{subject_description}}', `person in the image (${productTypeInfo?.name_en || photoType})`)
        .replace('{{angle_style}}', getOptionName(angleStyle, options.angles))
        .replace('{{lighting_style}}', getOptionName(lightingStyle, options.lighting))
        .replace('{{styling_style}}', getOptionName(stylingStyle, options.styling))
        .replace('{{outfit_style}}', (options.outfits && options.outfits.length > 0 && outfitStyle) ? getOptionName(outfitStyle, options.outfits) : 'N/A')
        .replace('{{background_style}}', finalBackgroundStyle || 'as specified')
        .replace('{{extra_instructions}}', extraInstructions || 'None')
        .replace('{{watermark_instruction}}', withWatermark ? `Add a watermark with the text: "${customWatermarkText || 'AI Tools Studio'}"` : 'Do not add any watermark.');

    parts.unshift({ text: filledPrompt });
    
    const promises = Array.from({ length: numberOfResults }).map(() => 
        callGeminiWithRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            return response;
        })
    );

    const responses = await Promise.all(promises);

    return responses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                prompt: filledPrompt
            };
        }
        throw new Error("Image generation failed to return an image.");
    });
};

export const upscaleImage = async (base64Data: string, mimeType: string, apiKey: string | null): Promise<string> => {
    if (!apiKey) throw new Error("API Key is missing for upscaling.");
    const ai = new GoogleGenAI({ apiKey });

    const imagePart = base64ToGenerativePart(base64Data, mimeType);
    const textPart = { text: "Upscale this image to a high resolution (2K), enhancing details and sharpness while maintaining photorealism. Do not alter the content of the image." };

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const upscaledImagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (upscaledImagePart?.inlineData) {
            return `data:${upscaledImagePart.inlineData.mimeType};base64,${upscaledImagePart.inlineData.data}`;
        }
        throw new Error("Upscaling failed to return an image.");
    });
};

export const getStyleRecommendations = async (generationConfig: GenerationConfig, activeView: string, userQuery: string, apiKey: string, language: 'id' | 'en') => {
    const ai = new GoogleGenAI({ apiKey });
    const { photoType } = generationConfig;
    const category = getProductCategory(photoType);
    const options = optionsByCategory[category];

    const prompt = `You are a friendly and helpful AI creative director. Your task is to provide style recommendations for a product photoshoot based on user's request.
    Current product type: ${photoType}. User's request: "${userQuery}".
    Available style options:
    - Angles: ${options.angles.map(o => o.name_en).join(', ')}
    - Lighting: ${options.lighting.map(o => o.name_en).join(', ')}
    - Styling: ${options.styling.map(o => o.name_en).join(', ')}
    - Backgrounds: ${options.backgrounds.map(o => o.name_en).join(', ')}
    ${(activeView === 'portrait' && options.outfits) ? `- Outfits: ${options.outfits.map(o => o.name_en).join(', ')}` : ''}

    Respond in ${language}. Your response must be a valid JSON object with two keys:
    1. "reasoning": A friendly explanation of your choices, formatted with markdown for lists or emphasis.
    2. "recommendations": A JSON object with recommended style keys (e.g., "angleStyle", "lightingStyle") and their corresponding English names from the lists above. Only include keys you are recommending.`;

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reasoning: { type: Type.STRING },
                        recommendations: { type: Type.OBJECT }
                    }
                }
            }
        });

        const resultText = sanitizeJson(response.text);
        return JSON.parse(resultText);
    });
};

export const getPosterRecommendations = async (posterConfig: PosterConfig, userQuery: string, apiKey: string, language: 'id' | 'en') => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = POSTER_ASSISTANT_SYSTEM_PROMPT_TEMPLATE
        .replace(/{{response_language}}/g, language)
        .replace('{{product_name}}', posterConfig.productName || 'the product')
        .replace('{{user_query}}', userQuery)
        .replace('{{theme_options}}', POSTER_THEMES.map(t => t.id).join(', '))
        .replace('{{color_palette_options}}', COLOR_PALETTES.map(p => p.id).join(', '))
        .replace('{{font_style_options}}', FONT_STYLES.map(f => f.id).join(', '));

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reasoning: { type: Type.STRING },
                        recommendations: { type: Type.OBJECT,
                            properties: {
                                theme: { type: Type.STRING },
                                colorPalette: { type: Type.STRING },
                                fontStyle: { type: Type.STRING },
                                headline: { type: Type.STRING },
                                bodyText: { type: Type.STRING },
                                cta: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });
        const resultText = sanitizeJson(response.text);
        return JSON.parse(resultText);
    });
};

export const getInitialPosterText = async (productName: string, apiKey: string, language: 'id' | 'en'): Promise<{ headline: string; bodyText: string; cta: string }> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = POSTER_INITIAL_TEXT_SYSTEM_PROMPT_TEMPLATE
        .replace('{{response_language}}', language)
        .replace('{{product_name}}', productName);

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        bodyText: { type: Type.STRING },
                        cta: { type: Type.STRING }
                    }
                }
            }
        });
        const resultText = sanitizeJson(response.text);
        return JSON.parse(resultText);
    });
};


export const generatePoster = async (sourceFile: File, config: PosterConfig, apiKey: string | null): Promise<GeneratedImage[]> => {
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(sourceFile);

    const prompt = POSTER_SYSTEM_PROMPT_TEMPLATE
        .replace('{{product_name}}', config.productName || '')
        .replace('{{theme}}', config.theme)
        .replace('{{color_palette}}', config.colorPalette)
        .replace('{{font_style}}', config.fontStyle)
        .replace('{{headline}}', config.headline)
        .replace('{{body_text}}', config.bodyText)
        .replace('{{cta}}', config.cta);

    const contents = { parts: [{ text: prompt }, imagePart] };

    const promises = Array.from({ length: 4 }).map(() =>
        callGeminiWithRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: contents,
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            return response;
        })
    );

    const responses = await Promise.all(promises);

    return responses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                prompt: prompt
            };
        }
        throw new Error("Poster generation failed to return an image.");
    });
};


export const generateVideoIdeas = async (productName: string, apiKey: string, language: 'id' | 'en'): Promise<{ videoPrompt: string }> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a short, creative, and cinematic video prompt in ${language} for a product named "${productName}". The prompt should be suitable for a generative video AI. Return a JSON object with a single key "videoPrompt".`;
    
    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { videoPrompt: { type: Type.STRING } } }
            }
        });
        const resultText = sanitizeJson(response.text);
        return JSON.parse(resultText);
    });
};

export const generateVideo = async (config: VideoConfig, apiKey: string): Promise<VideosOperation> => {
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = config.productImage ? await fileToGenerativePart(config.productImage) : undefined;
    
    const imageBytes = imagePart ? imagePart.inlineData.data : undefined;
    const mimeType = imagePart ? imagePart.inlineData.mimeType : undefined;

    return callGeminiWithRetry(async () => {
        return ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: config.videoPrompt,
            image: imageBytes && mimeType ? { imageBytes, mimeType } : undefined,
            config: {
                numberOfVideos: 1,
                aspectRatio: '16:9'
            }
        });
    });
};

export const checkVideoOperation = async (operation: VideosOperation, apiKey: string): Promise<VideosOperation> => {
    const ai = new GoogleGenAI({ apiKey });
    return callGeminiWithRetry(async () => {
        return ai.operations.getVideosOperation({ operation });
    });
};


export const generateUGCHookText = async (productName: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = UGC_HOOK_TEXT_SYSTEM_PROMPT.replace('{{product_name}}', productName);
    
    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { hookText: { type: Type.STRING } } }
            }
        });
        const result = JSON.parse(sanitizeJson(response.text));
        return result.hookText;
    });
};

export const generateUGCVideoPrompt = async (config: UGCVideoConfig, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = UGC_VIDEO_PROMPT_SYSTEM_PROMPT
        .replace('{{PRODUCT_NAME}}', config.productName)
        .replace('{{MODEL_DESCRIPTION}}', config.modelMode === 'ai' ? config.modelDescription : 'A model based on the uploaded image')
        .replace('{{TARGET_AUDIENCE}}', config.targetAudience)
        .replace('{{TONE}}', config.tone)
        .replace('{{OVERLAY_HOOK}}', config.overlayHook);
    
    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { videoPrompt: { type: Type.STRING } } }
            }
        });
        const result = JSON.parse(sanitizeJson(response.text));
        return result.videoPrompt;
    });
};


export const generateUGCVideo = async (config: UGCVideoConfig, prompt: string, apiKey: string): Promise<VideosOperation> => {
    const ai = new GoogleGenAI({ apiKey });
    
    let primaryImage: { imageBytes: string, mimeType: string } | undefined = undefined;

    if (config.modelMode === 'upload' && config.modelImage) {
        const modelPart = await fileToGenerativePart(config.modelImage);
        primaryImage = { imageBytes: modelPart.inlineData.data, mimeType: modelPart.inlineData.mimeType };
    } else if (config.productImage) {
        const productPart = await fileToGenerativePart(config.productImage);
        primaryImage = { imageBytes: productPart.inlineData.data, mimeType: productPart.inlineData.mimeType };
    }

    return callGeminiWithRetry(async () => {
        return ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: primaryImage,
            config: {
                numberOfVideos: 1,
                aspectRatio: '9:16'
            }
        });
    });
};

export const analyzeProductForUGCVideo = async (file: File, apiKey: string) => {
    const ai = new GoogleGenAI({apiKey});
    const imagePart = await fileToGenerativePart(file);
    
    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart] },
            config: {
                systemInstruction: UGC_PRODUCT_ANALYSIS_PROMPT_TEMPLATE,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING },
                        productCategory: { type: Type.STRING },
                        productBenefits: { type: Type.STRING },
                        productUsp: { type: Type.STRING },
                        targetAudience: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(sanitizeJson(response.text));
    });
};


export const generateUGCSoundVideo = async (config: UGCSoundVideoConfig, apiKey: string): Promise<VideosOperation> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = UGC_SOUND_VIDEO_PROMPT_TEMPLATE
        .replace(/{{product_name}}/g, config.productName)
        .replace(/{{product_benefits}}/g, config.productBenefits)
        .replace(/{{product_usp}}/g, config.productUsp)
        .replace(/{{tone}}/g, config.tone)
        .replace(/{{target_audience}}/g, config.targetAudience)
        .replace(/{{hook_text}}/g, config.hookText)
        .replace(/{{short_cta_text}}/g, config.shortCtaText)
        .replace(/{{voice_gender}}/g, config.voiceGender)
        .replace(/{{short_benefit_sentence}}/g, config.shortBenefitSentence)
        .replace(/{{target_audience_short}}/g, config.targetAudience); 

    const imagePart = config.productImage ? await fileToGenerativePart(config.productImage) : undefined;
    const imageBytes = imagePart ? imagePart.inlineData.data : undefined;
    const mimeType = imagePart ? imagePart.inlineData.mimeType : undefined;
    
    return callGeminiWithRetry(async () => {
        return ai.models.generateVideos({
            model: 'veo-3.1-generate-preview', // Model that supports native audio
            prompt,
            image: imageBytes && mimeType ? { imageBytes, mimeType } : undefined,
            config: {
                numberOfVideos: 1,
                aspectRatio: '9:16',
                nativeAudio: true
            }
        });
    });
};

export const generateUGCAffiliateAssets = async (config: UGCAffiliateConfig, apiKey: string): Promise<{ images: GeneratedImage[], audio: Uint8Array }> => {
    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Generate scripts and voiceover text
    const scriptPrompt = UGC_AFFILIATE_ASSETS_PROMPT_TEMPLATE
        .replace('{{productName}}', config.productName)
        .replace('{{backgroundStyle}}', config.backgroundStyle);

    const scriptResponse = await callGeminiWithRetry(async () => {
        return ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: scriptPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    script: { type: Type.STRING }
                                },
                                required: ["id", "script"]
                            }
                        },
                        voiceoverScript: { type: Type.STRING }
                    },
                    required: ["scenes", "voiceoverScript"]
                }
            }
        });
    });
    const { scenes, voiceoverScript } = JSON.parse(sanitizeJson(scriptResponse.text));

    // 2. Generate images for each scene sequentially to avoid rate limits
    const images: GeneratedImage[] = [];
    for (const scene of scenes) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between requests
        const image = await regenerateUGCAffiliateSceneImage(config, scene.id, apiKey, scene.script);
        images.push(image);
    }

    // 3. Generate audio from voiceover script
    const audioResponse = await callGeminiWithRetry(async () => {
        return ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text: voiceoverScript }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            }
        });
    });

    const audioPart = audioResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!audioPart?.inlineData) {
        throw new Error("Audio generation failed");
    }
    const audioBase64 = audioPart.inlineData.data;
    const binaryString = atob(audioBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return { images, audio: bytes };
};

export const regenerateUGCAffiliateSceneImage = async (config: UGCAffiliateConfig, sceneId: string, apiKey: string, sceneScript?: string): Promise<GeneratedImage> => {
    const ai = new GoogleGenAI({ apiKey });
    let modelInstruction: string;
    
    const parts: any[] = [];

    if (config.productImage) {
        parts.push(await fileToGenerativePart(config.productImage));
    }

    if (config.modelMode === 'upload' && config.modelImage) {
        modelInstruction = "Gambar referensi kedua adalah MODEL. Pertahankan kemiripan wajah model ini.";
        parts.push(await fileToGenerativePart(config.modelImage));
    } else {
        modelInstruction = `Gunakan model AI yang dideskripsikan sebagai: ${config.modelDescription}`;
    }

    if (!sceneScript) {
        sceneScript = `A scene for ${sceneId} about ${config.productName}`;
    }

    const prompt = UGC_AFFILIATE_REGENERATE_IMAGE_PROMPT_TEMPLATE
        .replace('{{model_instruction}}', modelInstruction)
        .replace('{{productName}}', config.productName)
        .replace('{{backgroundStyle}}', config.backgroundStyle)
        .replace('{{sceneScript}}', sceneScript);
    
    parts.unshift({ text: prompt });

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                prompt: sceneScript || ''
            };
        }
        throw new Error(`Image regeneration failed for scene ${sceneId}`);
    });
};


export const generateUGCAffiliateVideoFromImage = async (imageFile: File, sceneId: string, productName: string, apiKey: string): Promise<VideosOperation> => {
    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = await fileToGenerativePart(imageFile);
    const imageBytes = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;

    const prompt = UGC_AFFILIATE_VIDEO_FROM_IMAGE_PROMPT_TEMPLATE
        .replace('{{sceneContext}}', `A short UGC video scene for '${sceneId}'`)
        .replace('{{productName}}', productName);
        
    return callGeminiWithRetry(async () => {
        return ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: { imageBytes, mimeType },
            config: {
                numberOfVideos: 1,
                aspectRatio: '9:16'
            }
        });
    });
};

// --- Interactive Animation Functions ---

export const generateAnimationPlan = async (config: InteractiveAnimationConfig, apiKey: string) => {
    const ai = new GoogleGenAI({ apiKey });
    
    const parts: any[] = [];
    let imageAnalysis = "Gambar yang diupload: ";
    config.images.forEach((img, index) => {
        if (img) {
            imageAnalysis += `Gambar ${index + 1} (ada), `;
             // We are sending images to text model to understand context if supported, or just rely on user context. 
             // Gemini 2.5 Pro supports multimodal input.
        }
    });

    const prompt = INTERACTIVE_ANIMATION_PLAN_PROMPT_TEMPLATE
        .replace('{{context}}', config.context)
        .replace('{{animationStyle}}', config.animationStyle)
        .replace('{{backgroundAtmosphere}}', config.backgroundAtmosphere)
        .replace('{{image_analysis}}', imageAnalysis);
    
    // Add image parts
     for (const img of config.images) {
        if (img) parts.push(await fileToGenerativePart(img));
    }
    parts.unshift({ text: prompt });

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    animationDescription: { type: Type.STRING },
                                    headline: { type: Type.STRING },
                                    subHeadline: { type: Type.STRING },
                                    cta: { type: Type.STRING },
                                    voiceOverScript: { type: Type.STRING }
                                }
                            }
                        },
                        fullVoiceOverScript: { type: Type.STRING }
                    }
                }
            }
        });

        return JSON.parse(sanitizeJson(response.text));
    });
};

export const generateAnimationFrame = async (scene: any, config: InteractiveAnimationConfig, apiKey: string): Promise<GeneratedImage> => {
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];

    // Find a relevant image. For simplicity, use the first available image or round-robin.
    // In a real scenario, the LLM could suggest which image index to use.
    // Here we just pass all images as reference.
     for (const img of config.images) {
        if (img) parts.push(await fileToGenerativePart(img));
    }

    const prompt = INTERACTIVE_ANIMATION_FRAME_PROMPT_TEMPLATE
        .replace('{{animationDescription}}', scene.animationDescription)
        .replace('{{headline}}', scene.headline)
        .replace('{{subHeadline}}', scene.subHeadline)
        .replace('{{cta}}', scene.cta)
        .replace('{{animationStyle}}', config.animationStyle)
        .replace('{{backgroundAtmosphere}}', config.backgroundAtmosphere);
    
    parts.unshift({ text: prompt });

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                prompt: prompt
            };
        }
        throw new Error("Frame generation failed");
    });
};

export const generateAnimationAudio = async (script: string, apiKey: string): Promise<Blob> => {
     const ai = new GoogleGenAI({ apiKey });
     
     return callGeminiWithRetry(async () => {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text: script }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            }
        });

        const audioPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!audioPart?.inlineData) {
            throw new Error("Audio generation failed");
        }
        const audioBase64 = audioPart.inlineData.data;
        const binaryString = atob(audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: 'audio/mpeg' });
    });
}

export const generateFullAnimationVideo = async (scenes: InteractiveAnimationScene[], config: InteractiveAnimationConfig, apiKey: string): Promise<VideosOperation> => {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct prompt from scenes
    let fullPrompt = INTERACTIVE_ANIMATION_FULL_VIDEO_PROMPT_TEMPLATE
        .replace('{{context}}', config.context)
        .replace('{{animationStyle}}', config.animationStyle)
        .replace('{{backgroundAtmosphere}}', config.backgroundAtmosphere)
        .replace('{{fullVoiceOverScript}}', scenes.map(s => s.voiceOverScript).join(' '));

    scenes.forEach((scene, index) => {
        const i = index + 1;
        fullPrompt = fullPrompt
            .replace(`{{scene${i}_animation}}`, scene.animationDescription)
            .replace(`{{scene${i}_headline}}`, scene.headline)
            .replace(`{{scene${i}_subHeadline}}`, scene.subHeadline)
            .replace(`{{scene${i}_cta}}`, scene.cta)
            .replace(`{{scene${i}_vo}}`, scene.voiceOverScript);
    });

    // Use the first image as a starting reference
    const firstImage = config.images.find(img => img !== null);
    let imagePayload = undefined;
    if (firstImage) {
        const part = await fileToGenerativePart(firstImage);
        imagePayload = {
            imageBytes: part.inlineData.data,
            mimeType: part.inlineData.mimeType
        };
    }

    return callGeminiWithRetry(async () => {
        return ai.models.generateVideos({
            model: 'veo-3.1-generate-preview',
            prompt: fullPrompt,
            image: imagePayload,
            config: {
                numberOfVideos: 1,
                aspectRatio: '9:16',
                nativeAudio: true
            }
        });
    });
};

// --- Helper for Retries ---
async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.code === 429;
            const isOverloaded = error.message?.includes('503') || error.status === 503;
            
            if ((isRateLimit || isOverloaded) && attempt < retries - 1) {
                const delay = isRateLimit ? 15000 : initialDelay * Math.pow(2, attempt); // Longer delay for rate limits
                console.warn(`API Error ${error.status || 'unknown'}. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            } else {
                throw error;
            }
        }
    }
    throw new Error("Max retries exceeded");
}
