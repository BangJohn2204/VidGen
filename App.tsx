
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ProductNameInput } from './components/ProductNameInput';
import { StyleConfigurator } from './components/StyleConfigurator';
import { ResultsGrid } from './components/ResultDisplay';
import { Footer } from './components/Footer';
import { FeaturesModal } from './components/FeaturesModal';
import { FaqModal } from './components/FaqModal';
import { SettingsModal } from './components/SettingsModal';
import { MainMenu } from './components/MainMenu';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import type { GenerationConfig, ResultItem, AppSettings, ChatMessage, PosterConfig, VideoConfig, VideoResultItem, UGCVideoConfig, UGCSoundVideoConfig, UGCAffiliateConfig, UGCAffiliateScene, InteractiveAnimationConfig, InteractiveAnimationScene } from './types';
import { 
    generatePhotography, 
    upscaleImage, 
    getStyleRecommendations, 
    identifyProductFromImage, 
    generatePoster, 
    getPosterRecommendations, 
    getInitialPosterText, 
    generateVideoIdeas, 
    generateVideo, 
    checkVideoOperation, 
    generateUGCVideoPrompt, 
    generateUGCVideo, 
    generateUGCHookText, 
    analyzeProductForUGCVideo, 
    generateUGCSoundVideo, 
    generateUGCAffiliateAssets, 
    regenerateUGCAffiliateSceneImage, 
    generateUGCAffiliateVideoFromImage,
    generateAnimationPlan,
    generateAnimationFrame,
    generateAnimationAudio,
    generateFullAnimationVideo
} from './services/geminiService';
import { 
    MARKETING_PRODUCT_TYPES, 
    FOOD_PHOTOGRAPHY_PRODUCT_TYPES, 
    PORTRAIT_SUBJECT_TYPES,
    getProductCategory,
    optionsByCategory,
    StyleOption,
    POSTER_THEMES,
    COLOR_PALETTES,
    FONT_STYLES,
    RANDOM_OPTION,
    UGC_TONE_OPTIONS,
    OTHER_OPTION,
    UGC_AFFILIATE_BACKGROUNDS,
    ANIMATION_STYLES,
    BACKGROUND_ATMOSPHERES
} from './constants';
import { PencilIcon, SparklesIcon, XIcon, LayoutGridIcon, UsersIcon, FilmIcon } from './components/IconComponents';
import { setCookie } from './utils/cookies';
import { locales, Locale } from './i18n/locales';
import { PosterDesigner } from './components/PosterDesigner';
import { VideographyDesigner } from './components/VideographyDesigner';
import { UGCVideographyDesigner } from './components/UGCVideographyDesigner';
import { UGCSoundVideographyDesigner } from './components/UGCSoundVideographyDesigner';
import { UGCAffiliateDesigner } from './components/UGCAffiliateDesigner';
import { InteractiveAnimationDesigner } from './components/InteractiveAnimationDesigner';
import introJs from 'intro.js';

declare const JSZip: any;

export const defaultSettings: AppSettings = {
    theme: 'light',
    language: 'id',
    numberOfResults: 6,
    defaultWatermark: true,
    aspectRatio: '1:1',
};

type ActiveView = 'marketing' | 'food' | 'portrait' | 'poster' | 'videography' | 'ugcVideography' | 'ugcSoundVideography' | 'ugcAffiliate' | 'interactiveAnimation';

// --- Utility Functions ---
const findOptionIdByName = (name: string, options: StyleOption[]): string | null => {
    if (!name || !options) return null;
    const normalizedName = name.toLowerCase().trim();
    for (const option of options) {
        if (option.name_en.toLowerCase().trim() === normalizedName || option.name_id.toLowerCase().trim() === normalizedName) {
            return option.id;
        }
    }
    return null;
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


// --- Inlined Components ---

const ImagePreviewModal: React.FC<{ imageUrl: string | null; onClose: () => void; }> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors text-white">
                    <XIcon />
                </button>
            </div>
        </div>
    );
};

const PosterPromptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    t: {
        title: string;
        message: string;
        confirm: string;
        cancel: string;
    };
}> = ({ isOpen, onClose, onConfirm, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all text-center" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary-blue/10 text-primary-blue rounded-full">
                        <div className="w-8 h-8">
                            <LayoutGridIcon />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
                        {t.message}
                    </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                        {t.cancel}
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary-blue hover:bg-primary-dark text-white transition-colors">
                        {t.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AIAssistantWidget: React.FC<{ onClick: () => void; t: Locale['aiAssistant']; disabled: boolean }> = ({ onClick, t, disabled }) => (
    <button
        id="tour-step-ai-assistant"
        onClick={onClick}
        disabled={disabled}
        className={`fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary-blue text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label={t.widgetButton}
        title={t.widgetButton}
    >
        <div className="h-8 w-8">
            <SparklesIcon />
        </div>
    </button>
);

const AIAssistantModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    t: Locale['aiAssistant'];
}> = ({ isOpen, onClose, messages, onSendMessage, isLoading, t }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    if (!isOpen) return null;

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleApplyStyles = (recommendations: ChatMessage['recommendations']) => {
        onSendMessage(`Apply styles: ${JSON.stringify(recommendations)}`);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 transform transition-all flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <div className="w-6 h-6 text-primary-blue"><SparklesIcon /></div>
                        {t.modalTitle}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                        <XIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-blue text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'}`}>
                                <div className="text-sm prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.content }}></div>
                                {msg.recommendations && (
                                    <div className="mt-2 pt-2 border-t border-primary-blue/20 dark:border-white/20">
                                        <button onClick={() => handleApplyStyles(msg.recommendations)} className="w-full text-left text-xs font-bold bg-primary-blue/20 dark:bg-white/20 text-primary-blue dark:text-white px-3 py-1.5 rounded-md hover:opacity-80 transition">
                                            {t.applyButton} &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder={t.placeholder}
                            className="flex-1 w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-4 py-2 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const App: React.FC = () => {
    // --- State Management ---
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const savedSettings = localStorage.getItem('ai-tools-studio-settings');
            return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    });

    const t = locales[settings.language];
    const [activeView, setActiveView] = useState<ActiveView | 'main'>('main');
    
    // Photography states
    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [portraitProductImage, setPortraitProductImage] = useState<File | null>(null);
    const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
        photoType: MARKETING_PRODUCT_TYPES[0].id,
        productName: '',
        angleStyle: RANDOM_OPTION.id,
        lightingStyle: RANDOM_OPTION.id,
        stylingStyle: RANDOM_OPTION.id,
        outfitStyle: '',
        backgroundStyle: RANDOM_OPTION.id,
        customBackgroundStyle: '',
        extraInstructions: '',
        withWatermark: settings.defaultWatermark,
        customWatermarkText: '',
        portraitProductImage: null,
    });
    const [results, setResults] = useState<ResultItem[]>([]);
    
    // Poster states
    const [posterSourceImages, setPosterSourceImages] = useState<ResultItem[]>([]);
    const [manualPosterSourceFile, setManualPosterSourceFile] = useState<File | null>(null);
    const [posterConfig, setPosterConfig] = useState<PosterConfig>({
        productName: '',
        theme: POSTER_THEMES[0].id,
        colorPalette: COLOR_PALETTES[0].id,
        fontStyle: FONT_STYLES[0].id,
        headline: '', bodyText: '', cta: ''
    });
    const [posterResults, setPosterResults] = useState<ResultItem[]>([]);

    // Videography states
    const [videoConfig, setVideoConfig] = useState<VideoConfig>({
        productName: '', productImage: null, referenceImage: null, videoPrompt: '', aspectRatio: '16:9'
    });
    const [videoResult, setVideoResult] = useState<VideoResultItem>({ id: 1, status: 'empty' });
    const [hasSelectedApiKey, setHasSelectedApiKey] = useState(false);
    const operationCheckInterval = useRef<number | null>(null);

    // UGC Videography states
    const [ugcVideoConfig, setUgcVideoConfig] = useState<UGCVideoConfig>({
        productName: '', productImage: null, modelMode: 'upload', modelImage: null, modelDescription: '',
        targetAudience: '', tone: UGC_TONE_OPTIONS[0].id, overlayHook: ''
    });
    const [ugcVideoResult, setUgcVideoResult] = useState<VideoResultItem>({ id: 1, status: 'empty' });

    // UGC Sound Videography states
    const [ugcSoundVideoConfig, setUgcSoundVideoConfig] = useState<UGCSoundVideoConfig>({
        productName: '', productCategory: '', productBenefits: '', productUsp: '',
        productImage: null, voiceGender: 'wanita',
        targetAudience: '', tone: UGC_TONE_OPTIONS[0].id, hookText: '', shortBenefitSentence: '', shortCtaText: '',
    });
    const [ugcSoundVideoResult, setUgcSoundVideoResult] = useState<VideoResultItem>({ id: 1, status: 'empty' });
    const [isGeneratingUgcSoundVideo, setIsGeneratingUgcSoundVideo] = useState(false);
    const [isAnalyzingProductForUGC, setIsAnalyzingProductForUGC] = useState(false);
    
    // UGC Affiliate states
    const initialUGCAffiliateScenes: UGCAffiliateScene[] = [
        { id: 'hook', title_id: "Pengait (Hook)", title_en: "Hook", image: { id: 0, status: 'empty' }, video: { id: 0, status: 'empty' }, script: '' },
        { id: 'problem', title_id: "Masalah (Problem)", title_en: "Problem", image: { id: 1, status: 'empty' }, video: { id: 1, status: 'empty' }, script: '' },
        { id: 'solution', title_id: "Solusi (Solution)", title_en: "Solution", image: { id: 2, status: 'empty' }, video: { id: 2, status: 'empty' }, script: '' },
        { id: 'cta', title_id: "Ajakan (CTA)", title_en: "Call to Action", image: { id: 3, status: 'empty' }, video: { id: 3, status: 'empty' }, script: '' },
    ];
    const [ugcAffiliateConfig, setUgcAffiliateConfig] = useState<UGCAffiliateConfig>({
        productImage: null, 
        modelImage: null, 
        productName: '', 
        backgroundStyle: UGC_AFFILIATE_BACKGROUNDS[0].id,
        modelMode: 'upload',
        modelDescription: '',
    });
    const [ugcAffiliateScenes, setUgcAffiliateScenes] = useState<UGCAffiliateScene[]>(initialUGCAffiliateScenes);
    const [ugcAffiliateAudio, setUgcAffiliateAudio] = useState<{ url: string | null; status: 'empty' | 'generating' | 'completed' | 'error' }>({ url: null, status: 'empty' });
    const [isGeneratingUgcAffiliateAssets, setIsGeneratingUgcAffiliateAssets] = useState(false);
    const [generatingUgcSceneId, setGeneratingUgcSceneId] = useState<string | null>(null);

    // Interactive Animation states
    const [interactiveAnimationConfig, setInteractiveAnimationConfig] = useState<InteractiveAnimationConfig>({
        images: [null, null, null],
        context: '',
        animationStyle: ANIMATION_STYLES[0].id,
        backgroundAtmosphere: BACKGROUND_ATMOSPHERES[0].id,
    });
    const initialInteractiveAnimationScenes: InteractiveAnimationScene[] = [
        { id: 'opening', title_id: "Opening / Hook", title_en: "Opening / Hook", previewFrame: { id: 0, status: 'empty' }, animationDescription: '', headline: '', subHeadline: '', cta: '', voiceOverScript: '' },
        { id: 'context', title_id: "Konteks / Setup", title_en: "Context / Setup", previewFrame: { id: 1, status: 'empty' }, animationDescription: '', headline: '', subHeadline: '', cta: '', voiceOverScript: '' },
        { id: 'main', title_id: "Pesan Utama", title_en: "Main Message", previewFrame: { id: 2, status: 'empty' }, animationDescription: '', headline: '', subHeadline: '', cta: '', voiceOverScript: '' },
        { id: 'closing', title_id: "Penutup / CTA", title_en: "Closing / CTA", previewFrame: { id: 3, status: 'empty' }, animationDescription: '', headline: '', subHeadline: '', cta: '', voiceOverScript: '' },
    ];
    const [interactiveAnimationScenes, setInteractiveAnimationScenes] = useState<InteractiveAnimationScene[]>(initialInteractiveAnimationScenes);
    const [interactiveAnimationAudio, setInteractiveAnimationAudio] = useState<{ url: string | null; status: 'empty' | 'generating' | 'completed' | 'error' }>({ url: null, status: 'empty' });
    const [interactiveAnimationVideoResult, setInteractiveAnimationVideoResult] = useState<VideoResultItem>({ id: 1, status: 'empty' });

    const [isGeneratingAnimationPlan, setIsGeneratingAnimationPlan] = useState(false);
    const [isGeneratingAnimationAudio, setIsGeneratingAnimationAudio] = useState(false);
    const [isGeneratingFullAnimationVideo, setIsGeneratingFullAnimationVideo] = useState(false);


    // Loading & UI states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPosterPromptOpen, setIsPosterPromptOpen] = useState(false);
    const [selectedImageForPoster, setSelectedImageForPoster] = useState<number | null>(null);
    const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
    const [isGeneratingInitialPosterText, setIsGeneratingInitialPosterText] = useState(false);
    const [isGeneratingVideoIdeas, setIsGeneratingVideoIdeas] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isGeneratingUgcPrompt, setIsGeneratingUgcPrompt] = useState(false);
    const [isGeneratingUgcVideo, setIsGeneratingUgcVideo] = useState(false);
    const [isGeneratingUgcHook, setIsGeneratingUgcHook] = useState(false);


    // AI Assistant states
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const apiKey = process.env.API_KEY || null;

    // --- Effects ---

    useEffect(() => {
        localStorage.setItem('ai-tools-studio-settings', JSON.stringify(settings));
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings]);

    useEffect(() => {
        resetResults(settings.numberOfResults);
    }, [settings.numberOfResults]);
    
    useEffect(() => {
        return () => { // Cleanup on unmount
            if (operationCheckInterval.current) {
                clearInterval(operationCheckInterval.current);
            }
        };
    }, []);

    // --- Handlers & Callbacks ---

    const resetResults = (count: number) => {
        setResults(Array.from({ length: count }, (_, i) => ({ id: i, status: 'empty' })));
    };

    const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleConfigChange = useCallback(<K extends keyof GenerationConfig>(key: K, value: GenerationConfig[K]) => {
        setGenerationConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    const handlePosterConfigChange = useCallback(<K extends keyof PosterConfig>(key: K, value: PosterConfig[K]) => {
        setPosterConfig(prev => ({ ...prev, [key]: value }));
    }, []);
    
    const handleVideoConfigChange = useCallback(<K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) => {
        setVideoConfig(prev => ({ ...prev, [key]: value }));
    }, []);
    
    const handleUgcVideoConfigChange = useCallback(<K extends keyof UGCVideoConfig>(key: K, value: UGCVideoConfig[K]) => {
        setUgcVideoConfig(prev => ({ ...prev, [key]: value }));
    }, []);
    
    const handleUgcSoundVideoConfigChange = useCallback(<K extends keyof UGCSoundVideoConfig>(key: K, value: UGCSoundVideoConfig[K]) => {
        setUgcSoundVideoConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleUgcAffiliateConfigChange = useCallback((newConfig: Partial<UGCAffiliateConfig>) => {
        setUgcAffiliateConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const getFriendlyErrorMessage = (error: any) => {
        const message = (error.message || '').toLowerCase();
        if (message.includes('503') || message.includes('overloaded') || message.includes('unavailable')) {
            return t.app.modelOverloadedError;
        }
        return error instanceof Error ? error.message : t.app.generationErrorGeneral;
    };

    const handleProductImageSelect = useCallback(async (file: File) => {
        if (!apiKey) {
            alert(t.app.apiKeyMissingError);
            return;
        }
        setSourceImage(file);
        setIsIdentifying(true);
        setGenerationConfig(prev => ({ ...prev, productName: '' }));
        try {
            const { productName, photoType } = await identifyProductFromImage(file, apiKey);
            const category = getProductCategory(photoType);
            const options = optionsByCategory[category];
            setGenerationConfig(prev => ({
                ...prev,
                productName,
                photoType,
                angleStyle: options.angles[0].id,
                lightingStyle: options.lighting[0].id,
                stylingStyle: options.styling[0].id,
                backgroundStyle: options.backgrounds[0].id,
                outfitStyle: options.outfits.length > 0 ? options.outfits[0].id : '',
            }));
        } catch (error) {
            console.error("Identification failed:", error);
        } finally {
            setIsIdentifying(false);
        }
    }, [apiKey, t.app.apiKeyMissingError]);
    
    const handleManualPosterImageSelect = useCallback(async (file: File) => {
        if (!apiKey) return;
        setManualPosterSourceFile(file);
        setPosterSourceImages([]);
        setIsIdentifying(true);
        try {
            const { productName } = await identifyProductFromImage(file, apiKey);
            setPosterConfig(prev => ({ ...prev, productName }));
             setIsGeneratingInitialPosterText(true);
            const initialText = await getInitialPosterText(productName, apiKey, settings.language);
            setPosterConfig(prev => ({...prev, ...initialText}));
        } catch(e) {
            console.error("Failed to get initial poster text/product name", e);
        } finally {
            setIsIdentifying(false);
            setIsGeneratingInitialPosterText(false);
        }
    }, [apiKey, settings.language]);
    
    const handleVideographyProductImageSelect = useCallback(async (file: File) => {
        if (!apiKey) return;
        setVideoConfig(prev => ({ ...prev, productImage: file, productName: '' }));
        setIsIdentifying(true);
        setIsGeneratingVideoIdeas(true);
        try {
            const { productName } = await identifyProductFromImage(file, apiKey);
            setVideoConfig(prev => ({ ...prev, productName }));
            const ideas = await generateVideoIdeas(productName, apiKey, settings.language);
            setVideoConfig(prev => ({ ...prev, videoPrompt: ideas.videoPrompt }));
        } catch (error) {
            console.error("Failed to get video ideas:", error);
        } finally {
            setIsIdentifying(false);
            setIsGeneratingVideoIdeas(false);
        }
    }, [apiKey, settings.language]);

    const handleUgcSoundVideoProductImageSelect = async (file: File) => {
        if (!apiKey) {
            alert(t.app.apiKeyMissingError);
            return;
        }
        handleUgcSoundVideoConfigChange('productImage', file);
        setUgcSoundVideoConfig(prev => ({
            ...prev,
            productName: '',
            productCategory: '',
            productBenefits: '',
            productUsp: '',
            targetAudience: '',
            hookText: '',
            shortBenefitSentence: '',
            shortCtaText: '',
        }));
        
        setIsAnalyzingProductForUGC(true);
        try {
            const analysisResult = await analyzeProductForUGCVideo(file, apiKey);
            setUgcSoundVideoConfig(prev => ({ ...prev, ...analysisResult }));
        } catch (error) {
            console.error("UGC Product analysis failed:", error);
            alert(getFriendlyErrorMessage(error));
        } finally {
            setIsAnalyzingProductForUGC(false);
        }
    };

    const handleGenerate = async () => {
        if (!sourceImage) {
            alert(t.app.uploadError);
            return;
        }
        setIsGenerating(true);
        resetResults(settings.numberOfResults);

        try {
            const generatedImages = await generatePhotography(sourceImage, portraitProductImage, generationConfig, activeView as 'marketing' | 'food' | 'portrait', settings.numberOfResults, apiKey);
            setResults(generatedImages.map((img, i) => ({ id: i, status: 'completed', data: img })));
            if ((activeView === 'marketing' || activeView === 'food')) {
                setIsPosterPromptOpen(true);
            }
        } catch (error) {
            console.error("Generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setResults(prev => prev.map(r => r.status === 'generating' ? { ...r, status: 'error', errorMessage } : r));
        } finally {
            setIsGenerating(false);
        }
    };
    
    const startVideoOperationCheck = (operation: any, view: 'videography' | 'ugcVideography' | 'ugcSoundVideography' | 'ugcAffiliate' | 'interactiveAnimation', sceneId?: UGCAffiliateScene['id']) => {
        if (operationCheckInterval.current) clearInterval(operationCheckInterval.current);
        
        operationCheckInterval.current = window.setInterval(async () => {
            try {
                if (!apiKey) throw new Error("API key missing during operation check");
                const updatedOperation = await checkVideoOperation(operation, apiKey);
                
                if (updatedOperation.done) {
                    if (operationCheckInterval.current) clearInterval(operationCheckInterval.current);
                    if (updatedOperation.response) {
                        const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                             const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
                             const videoBlob = await videoResponse.blob();
                             const videoUrl = await blobToDataURL(videoBlob);
                             
                            if (view === 'videography') setVideoResult(prev => ({ ...prev, status: 'completed', videoUrl }));
                            if (view === 'ugcVideography') setUgcVideoResult(prev => ({ ...prev, status: 'completed', videoUrl }));
                            if (view === 'ugcSoundVideography') setUgcSoundVideoResult(prev => ({ ...prev, status: 'completed', videoUrl }));
                            if (view === 'ugcAffiliate' && sceneId) {
                                setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, video: { ...s.video, status: 'completed', videoUrl } } : s));
                                setGeneratingUgcSceneId(null);
                            }
                            if (view === 'interactiveAnimation') setInteractiveAnimationVideoResult({ id: 1, status: 'completed', videoUrl });

                        } else {
                             throw new Error("Operation completed but no video URI found.");
                        }
                    } else {
                        throw new Error("Operation finished with an error.");
                    }
                    if (view === 'videography') setIsGeneratingVideo(false);
                    if (view === 'ugcVideography') setIsGeneratingUgcVideo(false);
                    if (view === 'ugcSoundVideography') setIsGeneratingUgcSoundVideo(false);
                    if (view === 'interactiveAnimation') setIsGeneratingFullAnimationVideo(false);
                    // No need to turn off a global generating state for affiliate as it's per-scene

                }
            } catch (error) {
                console.error("Video operation check failed:", error);
                if (operationCheckInterval.current) clearInterval(operationCheckInterval.current);
                const errorMessage = getFriendlyErrorMessage(error);
                if (view === 'videography') setVideoResult({ id: 1, status: 'error', errorMessage });
                if (view === 'ugcVideography') setUgcVideoResult({ id: 1, status: 'error', errorMessage });
                if (view === 'ugcSoundVideography') setUgcSoundVideoResult({ id: 1, status: 'error', errorMessage });
                 if (view === 'ugcAffiliate' && sceneId) {
                    setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, video: { ...s.video, status: 'error', errorMessage } } : s));
                    setGeneratingUgcSceneId(null);
                }
                if (view === 'interactiveAnimation') setInteractiveAnimationVideoResult({ id: 1, status: 'error', errorMessage });

                if (view === 'videography') setIsGeneratingVideo(false);
                if (view === 'ugcVideography') setIsGeneratingUgcVideo(false);
                if (view === 'ugcSoundVideography') setIsGeneratingUgcSoundVideo(false);
                if (view === 'interactiveAnimation') setIsGeneratingFullAnimationVideo(false);

            }
        }, 10000); // Check every 10 seconds
    };

    const handleGenerateVideo = async () => {
        if (!videoConfig.productImage || !videoConfig.videoPrompt || !apiKey) return;
        
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
            setIsGeneratingVideo(true);
            setVideoResult({ id: 1, status: 'generating' });
            
            const operation = await generateVideo(videoConfig, apiKey);
            startVideoOperationCheck(operation, 'videography');

        } catch (error) {
            console.error("Video generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setVideoResult({ id: 1, status: 'error', errorMessage });
            setIsGeneratingVideo(false);
        }
    };
    
    const handleGenerateUgcHook = async () => {
        if (!ugcVideoConfig.productName || !apiKey) return;
        setIsGeneratingUgcHook(true);
        try {
            const hookText = await generateUGCHookText(ugcVideoConfig.productName, apiKey);
            handleUgcVideoConfigChange('overlayHook', hookText);
        } catch (error) {
            console.error("Failed to generate UGC hook text:", error);
        } finally {
            setIsGeneratingUgcHook(false);
        }
    };


    const handleGenerateUgcVideo = async () => {
        if (!ugcVideoConfig.productName || !apiKey) return;
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) await window.aistudio.openSelectKey();
           
            setIsGeneratingUgcPrompt(true);
            const prompt = await generateUGCVideoPrompt(ugcVideoConfig, apiKey);
            
            setIsGeneratingUgcPrompt(false);
            setIsGeneratingUgcVideo(true);
            setUgcVideoResult({ id: 1, status: 'generating' });
            
            const operation = await generateUGCVideo(ugcVideoConfig, prompt, apiKey);
            startVideoOperationCheck(operation, 'ugcVideography');

        } catch (error) {
            console.error("UGC Video generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setUgcVideoResult({ id: 1, status: 'error', errorMessage });
            setIsGeneratingUgcPrompt(false);
            setIsGeneratingUgcVideo(false);
        }
    };

    const handleGenerateUgcSoundVideo = async () => {
        if (!ugcSoundVideoConfig.productImage || !apiKey) return;
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) await window.aistudio.openSelectKey();
           
            setIsGeneratingUgcSoundVideo(true);
            setUgcSoundVideoResult({ id: 1, status: 'generating' });
            
            const operation = await generateUGCSoundVideo(ugcSoundVideoConfig, apiKey);
            startVideoOperationCheck(operation, 'ugcSoundVideography');

        } catch (error) {
            console.error("UGC Sound Video generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setUgcSoundVideoResult({ id: 1, status: 'error', errorMessage });
            setIsGeneratingUgcSoundVideo(false);
        }
    };
    
    const handleGenerateAllUgcAffiliateAssets = async () => {
        if (!ugcAffiliateConfig.productImage || !ugcAffiliateConfig.productName || (ugcAffiliateConfig.modelMode === 'upload' && !ugcAffiliateConfig.modelImage) || (ugcAffiliateConfig.modelMode === 'ai' && !ugcAffiliateConfig.modelDescription) || !apiKey) {
            alert(t.ugcAffiliateDesigner.inputsMissingError);
            return;
        }
        setIsGeneratingUgcAffiliateAssets(true);
        setUgcAffiliateScenes(initialUGCAffiliateScenes.map(s => ({ ...s, image: { ...s.image, status: 'generating' } })));
        setUgcAffiliateAudio({ url: null, status: 'generating' });

        try {
            const { images, audio } = await generateUGCAffiliateAssets(ugcAffiliateConfig, apiKey);
            
            setUgcAffiliateScenes(prev => prev.map((scene, i) => ({
                ...scene,
                image: { id: i, status: 'completed', data: images[i] },
                script: images[i].prompt, // The prompt is the script part
            })));

            const audioBlob = new Blob([audio], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setUgcAffiliateAudio({ url: audioUrl, status: 'completed' });

        } catch (error) {
            console.error("UGC Affiliate asset generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setUgcAffiliateScenes(prev => prev.map(s => s.image.status === 'generating' ? { ...s, image: { ...s.image, status: 'error', errorMessage } } : s));
            setUgcAffiliateAudio({ url: null, status: 'error' });
        } finally {
            setIsGeneratingUgcAffiliateAssets(false);
        }
    };

    const handleRegenerateUgcAffiliateSceneImage = async (sceneId: UGCAffiliateScene['id']) => {
        if (generatingUgcSceneId) return;
        if (!ugcAffiliateConfig.productImage || !ugcAffiliateConfig.productName || (ugcAffiliateConfig.modelMode === 'upload' && !ugcAffiliateConfig.modelImage) || (ugcAffiliateConfig.modelMode === 'ai' && !ugcAffiliateConfig.modelDescription) || !apiKey) return;
        
        setGeneratingUgcSceneId(sceneId);
        setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, image: { ...s.image, status: 'generating' }, video: {id: s.video.id, status: 'empty'} } : s));
        try {
            const newImage = await regenerateUGCAffiliateSceneImage(ugcAffiliateConfig, sceneId, apiKey);
            setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, image: { ...s.image, status: 'completed', data: newImage }, script: newImage.prompt } : s));
        } catch (error) {
            console.error(`Failed to regenerate image for scene ${sceneId}:`, error);
            const errorMessage = getFriendlyErrorMessage(error);
            setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, image: { ...s.image, status: 'error', errorMessage } } : s));
        } finally {
            setGeneratingUgcSceneId(null);
        }
    };

    const handleGenerateUgcAffiliateSceneVideo = async (sceneId: UGCAffiliateScene['id']) => {
        if (generatingUgcSceneId) return;
        const scene = ugcAffiliateScenes.find(s => s.id === sceneId);
        if (!scene || scene.image.status !== 'completed' || !scene.image.data || !apiKey) return;

        setGeneratingUgcSceneId(sceneId);
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) await window.aistudio.openSelectKey();

            setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, video: { ...s.video, status: 'generating' } } : s));
            
            const [header, base64Data] = scene.image.data.imageUrl.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            const imageFile = new File([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], 'scene.png', { type: mimeType });

            const operation = await generateUGCAffiliateVideoFromImage(imageFile, sceneId, ugcAffiliateConfig.productName, apiKey);
            startVideoOperationCheck(operation, 'ugcAffiliate', sceneId);

        } catch (error) {
            console.error(`Video generation failed for scene ${sceneId}:`, error);
            const errorMessage = getFriendlyErrorMessage(error);
            setUgcAffiliateScenes(prev => prev.map(s => s.id === sceneId ? { ...s, video: { ...s.video, status: 'error', errorMessage } } : s));
            setGeneratingUgcSceneId(null);
        }
    };

    const handleGenerateAnimationPlan = async () => {
        if (!interactiveAnimationConfig.images.some(img => img) || !interactiveAnimationConfig.context || !apiKey) {
            alert(t.interactiveAnimationDesigner.inputsMissingError);
            return;
        }

        setIsGeneratingAnimationPlan(true);
        setInteractiveAnimationScenes(prev => prev.map(s => ({ ...s, previewFrame: { ...s.previewFrame, status: 'generating' } })));
        
        try {
            const plan = await generateAnimationPlan(interactiveAnimationConfig, apiKey);
            
            // Update scenes with text first
            setInteractiveAnimationScenes(prev => prev.map(s => {
                const scenePlan = plan.scenes.find((p: any) => p.id === s.id);
                return scenePlan ? { ...s, ...scenePlan } : s;
            }));

            // Generate preview frames sequentially
            for (let i = 0; i < interactiveAnimationScenes.length; i++) {
                const scene = interactiveAnimationScenes[i];
                // Refresh scene data from latest plan
                const scenePlan = plan.scenes.find((p: any) => p.id === scene.id);
                if (!scenePlan) continue;

                // Short delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                     const frame = await generateAnimationFrame(
                        { ...scene, ...scenePlan },
                        interactiveAnimationConfig,
                        apiKey
                    );
                    setInteractiveAnimationScenes(prev => prev.map(s => s.id === scene.id ? { ...s, previewFrame: { id: i, status: 'completed', data: frame } } : s));
                } catch (err) {
                    console.error(`Failed to generate frame for ${scene.id}`, err);
                    setInteractiveAnimationScenes(prev => prev.map(s => s.id === scene.id ? { ...s, previewFrame: { id: i, status: 'error' } } : s));
                }
            }

        } catch (error) {
            console.error("Failed to generate animation plan:", error);
            setInteractiveAnimationScenes(prev => prev.map(s => ({ ...s, previewFrame: { ...s.previewFrame, status: 'error' } })));
        } finally {
            setIsGeneratingAnimationPlan(false);
        }
    };

    const handleGenerateAnimationAudio = async () => {
        if (!apiKey) return;
        const fullScript = interactiveAnimationScenes.map(s => s.voiceOverScript).join(' ');
        if (!fullScript) return;

        setIsGeneratingAnimationAudio(true);
        setInteractiveAnimationAudio({ url: null, status: 'generating' });

        try {
            const audioBlob = await generateAnimationAudio(fullScript, apiKey);
            const audioUrl = URL.createObjectURL(audioBlob);
            setInteractiveAnimationAudio({ url: audioUrl, status: 'completed' });
        } catch (error) {
            console.error("Audio generation failed:", error);
            setInteractiveAnimationAudio({ url: null, status: 'error' });
        } finally {
            setIsGeneratingAnimationAudio(false);
        }
    };

    const handleGenerateFullAnimationVideo = async () => {
        if (!apiKey) return;
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
             await window.aistudio.openSelectKey();
        }
        
        setIsGeneratingFullAnimationVideo(true);
        setInteractiveAnimationVideoResult({ id: 1, status: 'generating' });

        try {
            const operation = await generateFullAnimationVideo(interactiveAnimationScenes, interactiveAnimationConfig, apiKey);
            startVideoOperationCheck(operation, 'interactiveAnimation');
        } catch (error) {
             console.error("Full video generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setInteractiveAnimationVideoResult({ id: 1, status: 'error', errorMessage });
            setIsGeneratingFullAnimationVideo(false);
        }
    };


    const handleContinueToPoster = () => {
        const selectedImage = results.find(r => r.id === selectedImageForPoster);
        if (selectedImage) {
            setPosterSourceImages([selectedImage]);
            setPosterConfig(prev => ({...prev, productName: generationConfig.productName}));
            setActiveView('poster');
            setIsPosterPromptOpen(false);
            
            if (apiKey && generationConfig.productName) {
                setIsGeneratingInitialPosterText(true);
                getInitialPosterText(generationConfig.productName, apiKey, settings.language)
                    .then(initialText => setPosterConfig(prev => ({...prev, ...initialText})))
                    .catch(e => console.error("Failed to get initial poster text", e))
                    .finally(() => setIsGeneratingInitialPosterText(false));
            }
        }
    };

    const handleDownloadAll = () => {
        const zip = new JSZip();
        const promises = results
            .filter(r => r.status === 'completed' && (r.upscaledImageUrl || r.data?.imageUrl))
            .map(async (r, i) => {
                const url = r.upscaledImageUrl || r.data!.imageUrl;
                const response = await fetch(url);
                const blob = await response.blob();
                zip.file(`image_${i + 1}.png`, blob);
            });

        Promise.all(promises).then(() => {
            zip.generateAsync({ type: 'blob' }).then((content: any) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'ai-tools-studio-results.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });
    };
    
    const handleDownloadAllPosters = () => {
        const zip = new JSZip();
        const promises = posterResults
            .filter(r => r.status === 'completed' && r.data?.imageUrl)
            .map(async (r, i) => {
                const url = r.data!.imageUrl;
                const response = await fetch(url);
                const blob = await response.blob();
                zip.file(`poster_${i + 1}.png`, blob);
            });

        Promise.all(promises).then(() => {
            zip.generateAsync({ type: 'blob' }).then((content: any) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'ai-tools-studio-posters.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });
    };

    const handleUpscaleAll = async () => {
        setIsUpscaling(true);
        const upscalePromises = results.map(result => {
            if (result.status === 'completed' && result.data && !result.upscaledImageUrl) {
                setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'upscaling' } : r));
                const [header, base64Data] = result.data.imageUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
                
                return upscaleImage(base64Data, mimeType, apiKey)
                    .then(upscaledUrl => {
                        setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'completed', upscaledImageUrl: upscaledUrl } : r));
                    })
                    .catch(err => {
                        console.error(`Upscale failed for result ${result.id}:`, err);
                        setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'completed', errorMessage: 'Upscale failed' } : r)); // Revert status
                    });
            }
            return Promise.resolve();
        });

        try {
            await Promise.all(upscalePromises);
        } catch (error) {
            console.error("An error occurred during upscaling:", error);
            alert(t.app.upscaleError);
        } finally {
            setIsUpscaling(false);
        }
    };
    
    const handleGeneratePoster = async (selectedImgs: ResultItem[], config: PosterConfig) => {
        const sourceFile = selectedImgs.length > 0 ? selectedImgs[0] : (manualPosterSourceFile ? { data: { imageUrl: URL.createObjectURL(manualPosterSourceFile) }} : null);
        if (!sourceFile || !sourceFile.data?.imageUrl) return;
    
        setIsGeneratingPoster(true);
        setPosterResults(Array.from({ length: 4 }, (_, i) => ({ id: i, status: 'generating' })));

        try {
            const response = await fetch(sourceFile.data.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "source.png", { type: blob.type });

            const generatedPosters = await generatePoster(file, config, apiKey);
            setPosterResults(generatedPosters.map((p, i) => ({ id: i, status: 'completed', data: p })));
        } catch (error) {
            console.error("Poster generation failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setPosterResults(prev => prev.map(r => r.status === 'generating' ? { ...r, status: 'error', errorMessage } : r));
        } finally {
            setIsGeneratingPoster(false);
        }
    };
    
    // --- Tour ---
    const startTour = () => {
        introJs().setOptions({
            steps: [
                { title: t.tour.welcomeTitle, intro: t.tour.welcomeIntro },
                { element: '#tour-step-image-uploader', title: t.tour.step1Title, intro: t.tour.step1Intro },
                { element: '#tour-step-product-name', title: t.tour.step2Title, intro: t.tour.step2Intro },
                { element: '#tour-step-style-config', title: t.tour.step3Title, intro: t.tour.step3Intro },
                { element: '#tour-step-generate-button', title: t.tour.step4Title, intro: t.tour.step4Intro },
                { element: '#tour-step-results-grid', title: t.tour.step5Title, intro: t.tour.step5Intro },
                { element: '#tour-step-ai-assistant', title: t.tour.step6Title, intro: t.tour.step6Intro },
                { element: '#tour-step-header-controls', title: t.tour.step7Title, intro: t.tour.step7Intro },
            ],
            nextLabel: t.tour.next,
            prevLabel: t.tour.prev,
            doneLabel: t.tour.done,
            tooltipClass: `custom-tooltip ${settings.theme}`
        }).start();
    };

    // --- Render Logic ---

    const renderView = () => {
        const commonPhotographyProps = {
            t: t.resultsGrid,
            sourceImage,
            styleImage: portraitProductImage,
            onProductImageSelect: handleProductImageSelect,
            onStyleImageSelect: setPortraitProductImage,
            generationConfig,
            onConfigChange: handleConfigChange,
            isIdentifying,
            isGenerating,
            onGenerate: handleGenerate,
            results,
            isUpscaling,
            onUpscaleAll: handleUpscaleAll,
            onDownloadAll: handleDownloadAll,
            onPreview: (url: string) => { setPreviewImageUrl(url); setIsPreviewOpen(true); },
            settings,
            aspectRatio: settings.aspectRatio,
            selectedImageId: selectedImageForPoster,
            onSelectImage: setSelectedImageForPoster,
            onContinueToPoster: handleContinueToPoster
        };
        
        const GenerateButton = () => (
            <button
                id="tour-step-generate-button"
                onClick={handleGenerate}
                disabled={isGenerating || !sourceImage}
                className="w-full bg-gradient-to-r from-primary-blue-light to-primary-blue text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-blue hover:to-primary-dark transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t.app.processing}</span>
                    </>
                ) : (
                    <>
                        <div className="w-5 h-5"><PencilIcon /></div>
                        <span>{t.app.generateButton}</span>
                    </>
                )}
            </button>
        );

        const views: Record<ActiveView, React.ReactElement> = {
            marketing: (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        <ImageUploader onImageSelect={handleProductImageSelect} onImageRemove={() => setSourceImage(null)} sourceImage={sourceImage} t={t.imageUploader} />
                        <ProductNameInput value={generationConfig.productName || ''} onChange={(val) => handleConfigChange('productName', val)} t={t.productNameInput} view="marketing" isLoading={isIdentifying} />
                        <StyleConfigurator config={generationConfig} onConfigChange={handleConfigChange} t={t.styleConfigurator} lang={settings.language} view="marketing" isLoading={isGenerating} />
                        <GenerateButton />
                    </div>
                    <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-6">
                        <ResultsGrid {...commonPhotographyProps} activeView="marketing"/>
                    </div>
                </div>
            ),
            food: (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        <ImageUploader onImageSelect={handleProductImageSelect} onImageRemove={() => setSourceImage(null)} sourceImage={sourceImage} t={t.imageUploader} />
                        <ProductNameInput value={generationConfig.productName || ''} onChange={(val) => handleConfigChange('productName', val)} t={t.productNameInput} view="food" isLoading={isIdentifying} />
                        <StyleConfigurator config={generationConfig} onConfigChange={handleConfigChange} t={t.styleConfigurator} lang={settings.language} view="food" isLoading={isGenerating} />
                        <GenerateButton />
                    </div>
                    <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-6">
                         <ResultsGrid {...commonPhotographyProps} activeView="food"/>
                    </div>
                </div>
            ),
            portrait: (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        <ImageUploader onImageSelect={handleProductImageSelect} onImageRemove={() => setSourceImage(null)} sourceImage={sourceImage} t={t.imageUploader} />
                        <ImageUploader onImageSelect={setPortraitProductImage} onImageRemove={() => setPortraitProductImage(null)} sourceImage={portraitProductImage} t={{ ...t.imageUploader, title: t.imageUploader.styleImageTitle, subtitle: t.imageUploader.styleImageSubtitle }} stepNumber="2" />
                        <StyleConfigurator config={generationConfig} onConfigChange={handleConfigChange} t={t.styleConfigurator} lang={settings.language} view="portrait" isLoading={isGenerating} />
                        <GenerateButton />
                    </div>
                    <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-6">
                         <ResultsGrid {...commonPhotographyProps} activeView="portrait"/>
                    </div>
                </div>
            ),
            poster: (
                 <PosterDesigner
                    sourceImages={posterSourceImages}
                    manualSourceFile={manualPosterSourceFile}
                    onManualImageSelect={handleManualPosterImageSelect}
                    onManualImageRemove={() => setManualPosterSourceFile(null)}
                    onGeneratePoster={handleGeneratePoster}
                    isGenerating={isGeneratingPoster}
                    isIdentifying={isIdentifying}
                    isGeneratingInitialText={isGeneratingInitialPosterText}
                    posterResults={posterResults}
                    onPreview={(url: string) => { setPreviewImageUrl(url); setIsPreviewOpen(true); }}
                    onDownloadAll={handleDownloadAllPosters}
                    posterConfig={posterConfig}
                    onPosterConfigChange={handlePosterConfigChange}
                    t={t.posterDesigner}
                    t_imageUploader={t.imageUploader}
                    lang={settings.language}
                />
            ),
            videography: (
                <VideographyDesigner
                    videoConfig={videoConfig}
                    onVideoConfigChange={handleVideoConfigChange}
                    onProductImageSelect={handleVideographyProductImageSelect}
                    onReferenceImageSelect={(file) => handleVideoConfigChange('referenceImage', file)}
                    isIdentifying={isIdentifying}
                    isGeneratingIdeas={isGeneratingVideoIdeas}
                    onGenerateVideo={handleGenerateVideo}
                    isGeneratingVideo={isGeneratingVideo}
                    videoResult={videoResult}
                    t={t.videographyDesigner}
                    t_imageUploader={t.imageUploader}
                />
            ),
            ugcVideography: (
                 <UGCVideographyDesigner
                    config={ugcVideoConfig}
                    onConfigChange={handleUgcVideoConfigChange}
                    onGenerate={handleGenerateUgcVideo}
                    onGenerateHook={handleGenerateUgcHook}
                    isGeneratingPrompt={isGeneratingUgcPrompt}
                    isGeneratingVideo={isGeneratingUgcVideo}
                    isGeneratingHook={isGeneratingUgcHook}
                    result={ugcVideoResult}
                    t={t.ugcVideographyDesigner}
                    lang={settings.language}
                 />
            ),
            ugcSoundVideography: (
                 <UGCSoundVideographyDesigner
                    config={ugcSoundVideoConfig}
                    onConfigChange={handleUgcSoundVideoConfigChange}
                    onGenerate={handleGenerateUgcSoundVideo}
                    isGeneratingVideo={isGeneratingUgcSoundVideo}
                    result={ugcSoundVideoResult}
                    t={t.ugcSoundVideographyDesigner}
                    lang={settings.language}
                    onProductImageSelect={handleUgcSoundVideoProductImageSelect}
                    isAnalyzing={isAnalyzingProductForUGC}
                 />
            ),
             ugcAffiliate: (
                <UGCAffiliateDesigner
                    config={ugcAffiliateConfig}
                    onConfigChange={handleUgcAffiliateConfigChange}
                    scenes={ugcAffiliateScenes}
                    onScenesChange={setUgcAffiliateScenes}
                    voiceOverAudio={ugcAffiliateAudio}
                    onVoiceOverAudioChange={setUgcAffiliateAudio}
                    onGenerateAll={handleGenerateAllUgcAffiliateAssets}
                    onRegenerateSceneImage={handleRegenerateUgcAffiliateSceneImage}
                    onGenerateSceneVideo={handleGenerateUgcAffiliateSceneVideo}
                    isGeneratingAll={isGeneratingUgcAffiliateAssets}
                    generatingSceneId={generatingUgcSceneId}
                    t={t.ugcAffiliateDesigner}
                    lang={settings.language}
                />
            ),
             interactiveAnimation: (
                <InteractiveAnimationDesigner
                    config={interactiveAnimationConfig}
                    onConfigChange={(newConfig) => setInteractiveAnimationConfig(prev => ({ ...prev, ...newConfig }))}
                    scenes={interactiveAnimationScenes}
                    onScenesChange={setInteractiveAnimationScenes}
                    audio={interactiveAnimationAudio}
                    videoResult={interactiveAnimationVideoResult}
                    onGeneratePlan={handleGenerateAnimationPlan}
                    onGenerateAudio={handleGenerateAnimationAudio}
                    onGenerateFullVideo={handleGenerateFullAnimationVideo}
                    isGeneratingPlan={isGeneratingAnimationPlan}
                    isGeneratingAudio={isGeneratingAnimationAudio}
                    isGeneratingVideo={isGeneratingFullAnimationVideo}
                    t={t.interactiveAnimationDesigner}
                    lang={settings.language}
                />
            ),
        };

        return views[activeView];
    };
    
    const handleAssistantSendMessage = async (message: string) => {
        if (!apiKey) return;

        setIsAssistantLoading(true);
        const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: message }];
        setChatMessages(updatedMessages);

        try {
            if (message.startsWith('Apply styles:')) {
                const recommendations = JSON.parse(message.replace('Apply styles: ', ''));
                if (activeView === 'poster') {
                    setPosterConfig(prev => ({ ...prev, ...recommendations }));
                } else {
                    setGenerationConfig(prev => ({ ...prev, ...recommendations }));
                }
                setChatMessages(prev => [...prev, { role: 'model', content: t.aiAssistant.appliedMessage }]);
            } else {
                let response;
                if (activeView === 'poster') {
                    response = await getPosterRecommendations(posterConfig, message, apiKey, settings.language);
                    const { reasoning, recommendations } = response;
                    const modelMessage: ChatMessage = {
                        role: 'model',
                        content: reasoning,
                        recommendations
                    };
                    setChatMessages(prev => [...prev, modelMessage]);
                } else {
                    response = await getStyleRecommendations(generationConfig, activeView as 'marketing' | 'food' | 'portrait', message, apiKey, settings.language);
                    const { reasoning, recommendations } = response;

                    const idRecommendations: Partial<GenerationConfig> = {};
                    const category = getProductCategory(generationConfig.photoType);

                    if (recommendations.angleStyle) {
                        idRecommendations.angleStyle = findOptionIdByName(recommendations.angleStyle, optionsByCategory[category].angles) || recommendations.angleStyle;
                    }
                    if (recommendations.lightingStyle) {
                        idRecommendations.lightingStyle = findOptionIdByName(recommendations.lightingStyle, optionsByCategory[category].lighting) || recommendations.lightingStyle;
                    }
                    if (recommendations.stylingStyle) {
                        idRecommendations.stylingStyle = findOptionIdByName(recommendations.stylingStyle, optionsByCategory[category].styling) || recommendations.stylingStyle;
                    }
                     if (recommendations.backgroundStyle) {
                        const bgId = findOptionIdByName(recommendations.backgroundStyle, optionsByCategory[category].backgrounds);
                        if (bgId) {
                             idRecommendations.backgroundStyle = bgId;
                        } else {
                             idRecommendations.backgroundStyle = OTHER_OPTION.id;
                             idRecommendations.customBackgroundStyle = recommendations.backgroundStyle;
                        }
                    }
                     if (activeView === 'portrait' && recommendations.outfitStyle) {
                        idRecommendations.outfitStyle = findOptionIdByName(recommendations.outfitStyle, optionsByCategory[category].outfits) || recommendations.outfitStyle;
                    }


                    const modelMessage: ChatMessage = {
                        role: 'model',
                        content: reasoning,
                        recommendations: idRecommendations
                    };
                    setChatMessages(prev => [...prev, modelMessage]);
                }
            }
        } catch (error) {
            console.error("AI Assistant failed:", error);
            const errorMessage = getFriendlyErrorMessage(error);
            setChatMessages(prev => [...prev, { role: 'model', content: `Sorry, I ran into an error: ${errorMessage}` }]);
        } finally {
            setIsAssistantLoading(false);
        }
    };

    if (activeView === 'main') {
        return <MainMenu
            onToolSelect={(view) => {
                setActiveView(view);
                // Reset states for new tool
                setResults(Array.from({ length: settings.numberOfResults }, (_, i) => ({ id: i, status: 'empty' })));
                setSourceImage(null);
                setPortraitProductImage(null);
                setPosterSourceImages([]);
                setManualPosterSourceFile(null);
                setPosterResults([]);
                // Reset Interactive Animation state
                setInteractiveAnimationConfig({
                    images: [null, null, null],
                    context: '',
                    animationStyle: ANIMATION_STYLES[0].id,
                    backgroundAtmosphere: BACKGROUND_ATMOSPHERES[0].id,
                });
                setInteractiveAnimationScenes(initialInteractiveAnimationScenes);
                setInteractiveAnimationAudio({ url: null, status: 'empty' });
                setInteractiveAnimationVideoResult({ id: 1, status: 'empty' });
            }}
            onSettingsClick={() => setIsSettingsModalOpen(true)}
            t={t.mainMenu}
            t_header={t.header}
            settings={settings}
            onSettingsChange={handleSettingsChange}
        />;
    }

    const currentViewTitleKey = activeView === 'interactiveAnimation' ? 'interactiveAnimation' :
                                activeView === 'ugcAffiliate' ? 'ugcAffiliateCreation' :
                                activeView === 'ugcSoundVideography' ? 'ugcSoundVideoCreation' :
                                activeView === 'ugcVideography' ? 'ugcVideoCreation' : 
                                activeView === 'videography' ? 'videoCreation' :
                                activeView === 'poster' ? 'posterDesign' :
                                activeView === 'portrait' ? 'portraitPhotography' :
                                activeView === 'food' ? 'foodPhotography' : 'productPhotography';

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans">
             <div className="flex flex-1 w-full max-w-screen-2xl mx-auto">
                <Sidebar
                    activeView={activeView}
                    onViewChange={(view) => {
                        setActiveView(view);
                        setChatMessages([]);
                    }}
                    onSettingsClick={() => setIsSettingsModalOpen(true)}
                    t={t.sidebar}
                />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header
                        title={t.sidebar[currentViewTitleKey]}
                        activeView={activeView}
                        settings={settings}
                        onSettingsChange={handleSettingsChange}
                        t={t.header}
                        onGoBack={() => setActiveView('main')}
                        onStartTour={startTour}
                    />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                        <div className="max-w-6xl mx-auto">
                            {renderView()}
                        </div>
                    </main>
                </div>
            </div>

            <Footer onFeaturesClick={() => setIsFeaturesModalOpen(true)} onFaqClick={() => setIsFaqModalOpen(true)} t={t.footer} />
            
            <BottomNav 
                activeView={activeView} 
                onViewChange={(view) => {
                    setActiveView(view);
                    setChatMessages([]);
                }}
                onSettingsClick={() => setIsSettingsModalOpen(true)} 
                t={t.bottomNav} 
            />

            <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => { setPreviewImageUrl(null); setIsPreviewOpen(false); }} />
            <FeaturesModal isOpen={isFeaturesModalOpen} onClose={() => setIsFeaturesModalOpen(false)} t={t.featuresModal} />
            <FaqModal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} t={t.faqModal} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} onSettingsChange={handleSettingsChange} t={t.settingsModal} />

            <PosterPromptModal
                isOpen={isPosterPromptOpen}
                onClose={() => setIsPosterPromptOpen(false)}
                onConfirm={handleContinueToPoster}
                t={{
                    title: t.app.posterPromptTitle,
                    message: t.app.posterPromptMessage,
                    confirm: t.app.posterPromptConfirm,
                    cancel: t.app.posterPromptCancel,
                }}
            />
            
             <AIAssistantWidget onClick={() => setIsAssistantOpen(true)} t={t.aiAssistant} disabled={activeView === 'videography' || activeView === 'ugcVideography' || activeView === 'ugcSoundVideography' || activeView === 'ugcAffiliate' || activeView === 'interactiveAnimation'} />
            <AIAssistantModal
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                messages={chatMessages}
                onSendMessage={handleAssistantSendMessage}
                isLoading={isAssistantLoading}
                t={t.aiAssistant}
            />
        </div>
    );
};
