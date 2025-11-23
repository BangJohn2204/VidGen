

import React from 'react';
import type { VideoConfig, VideoResultItem } from '../types';
import type { VideographyDesignerLocale, ImageUploaderLocale } from '../i18n/locales';
import { ImageIcon, PencilIcon, Loader2Icon, DownloadIcon, VideoIcon } from './IconComponents';
import { ImageUploader } from './ImageUploader';

interface VideographyDesignerProps {
    videoConfig: VideoConfig;
    onVideoConfigChange: <K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) => void;
    onProductImageSelect: (file: File) => void;
    onReferenceImageSelect: (file: File) => void;
    isIdentifying: boolean;
    isGeneratingIdeas: boolean;
    onGenerateVideo: () => void;
    isGeneratingVideo: boolean;
    videoResult: VideoResultItem;
    t: VideographyDesignerLocale;
    t_imageUploader: ImageUploaderLocale;
}


export const VideographyDesigner: React.FC<VideographyDesignerProps> = ({
    videoConfig, onVideoConfigChange, onProductImageSelect, onReferenceImageSelect,
    isIdentifying, isGeneratingIdeas, onGenerateVideo, isGeneratingVideo,
    videoResult, t, t_imageUploader
}) => {

    const productImageUploaderLocale: ImageUploaderLocale = {
        ...t_imageUploader,
        title: t.sourceImageTitle,
        subtitle: t.sourceImageSubtitle,
    };

    const referenceImageUploaderLocale: ImageUploaderLocale = {
        ...t_imageUploader,
        title: t.referenceImageTitle,
        subtitle: t.referenceImageSubtitle,
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left form */}
            <div className="lg:col-span-5 space-y-6">
                <ImageUploader
                    onImageSelect={onProductImageSelect}
                    onImageRemove={() => onVideoConfigChange('productImage', null)}
                    sourceImage={videoConfig.productImage}
                    t={productImageUploaderLocale}
                    stepNumber="1"
                />

                <ImageUploader
                    onImageSelect={onReferenceImageSelect}
                    onImageRemove={() => onVideoConfigChange('referenceImage', null)}
                    sourceImage={videoConfig.referenceImage}
                    t={referenceImageUploaderLocale}
                    stepNumber="2"
                />

                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.productNameTitle}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">{t.productNameSubtitle}</p>
                    
                    <div className="relative ml-10">
                        <input type="text" placeholder={(isIdentifying || isGeneratingIdeas) ? t.identifying : t.productNamePlaceholder} value={videoConfig.productName || ''} onChange={(e) => onVideoConfigChange('productName', e.target.value)} disabled={isIdentifying || isGeneratingIdeas} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70" />
                        {(isIdentifying || isGeneratingIdeas) && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2Icon /></div>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block ml-10">{t.videoPromptTitle}</label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 ml-10 mb-2">{t.videoPromptSubtitle}</p>
                        <textarea placeholder={isGeneratingIdeas ? t.generatingIdeas : t.videoPromptPlaceholder} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm resize-none custom-scrollbar ml-10" rows={3} value={videoConfig.videoPrompt} onChange={(e) => onVideoConfigChange('videoPrompt', e.target.value)} disabled={isGeneratingIdeas} />
                    </div>
                </div>

                <button onClick={onGenerateVideo} disabled={isGeneratingVideo || !videoConfig.productImage || !videoConfig.videoPrompt} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGeneratingVideo ? (
                        <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>{t.generatingVideo}</span></>
                    ) : (
                        <><div className="w-5 h-5"><PencilIcon /></div><span>{t.generateVideoButton}</span></>
                    )}
                </button>
            </div>

            {/* Right result */}
            <div className="lg:col-span-7 lg:sticky lg:top-6">
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">4</span>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.videoResultTitle}</h2>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">{t.videoResultSubtitle}</p>
                        </div>
                         {videoResult.status === 'completed' && videoResult.videoUrl && (
                            <a href={videoResult.videoUrl} download={`video_${Date.now()}.mp4`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                                <DownloadIcon small />
                                <span>{t.downloadVideo}</span>
                            </a>
                        )}
                    </div>

                    <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center relative overflow-hidden">
                        {videoResult.status === 'generating' && (
                             <div className="text-center z-10 p-4">
                                <Loader2Icon />
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 font-medium drop-shadow-md">{t.generatingVideo}</p>
                            </div>
                        )}
                        {videoResult.status === 'empty' && (
                             <div className="text-center text-neutral-400 dark:text-neutral-600">
                                <div className="w-12 h-12 mx-auto"><VideoIcon /></div>
                                <p className="mt-2 text-sm">{t.videoResultEmpty}</p>
                            </div>
                        )}
                        {videoResult.status === 'completed' && videoResult.videoUrl && (
                            <video src={videoResult.videoUrl} controls className="w-full h-full object-contain" />
                        )}
                        {videoResult.status === 'error' && (
                            <div className="text-center text-red-700 dark:text-red-300 p-4">
                                <p className="text-sm font-semibold">{t.errorState}</p>
                                <p className="text-xs">{videoResult.errorMessage}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-xs">
                        {t.videoGenNotice}
                    </div>
                </div>
            </div>
        </div>
    );
};