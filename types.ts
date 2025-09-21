
export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface VideoGenerationParams {
  prompt: string;
  image?: {
    data: string; // base64 encoded string
    mimeType: string;
  };
  aspectRatio: AspectRatio;
  withSound: boolean;
  resolution: Resolution;
}
