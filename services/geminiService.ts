
import { GoogleGenAI } from "@google/genai";
import { VideoGenerationParams } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

const pollOperation = async (operation: any) => {
  let currentOperation = operation;
  while (!currentOperation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
    } catch (error) {
      console.error("Error polling for video operation status:", error);
      throw new Error("Failed to get video generation status.");
    }
  }
  return currentOperation;
};

export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
  try {
    const apiParams: any = {
      model: 'veo-3.0-generate-preview',
      prompt: params.prompt,
      config: {
        numberOfVideos: 1,
        // NOTE: The following config options are based on the user request.
        // They may not be officially supported by the 'veo-2.0-generate-001' model yet.
        // The API may ignore them if they are not valid parameters.
        aspectRatio: params.aspectRatio,
        withSound: params.withSound,
        resolution: params.resolution,
      }
    };

    if (params.image) {
      apiParams.image = {
        imageBytes: params.image.data,
        mimeType: params.image.mimeType
      };
    }

    let initialOperation = await ai.models.generateVideos(apiParams);
    const finalOperation = await pollOperation(initialOperation);

    const downloadLink = finalOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was provided.");
    }
    
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY || "YOUR_API_KEY_HERE"}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download the generated video. Status: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return videoUrl;

  } catch (error) {
    console.error('Error generating video:', error);
    if (error instanceof Error) {
        throw new Error(`Video generation failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during video generation.');
  }
};
