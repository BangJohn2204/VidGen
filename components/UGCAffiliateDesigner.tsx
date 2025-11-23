

import React, { useState } from 'react';
import type { UGCAffiliateConfig, UGCAffiliateScene, ResultItem, VideoResultItem } from '../types';
import type { UGCAffiliateDesignerLocale, ImageUploaderLocale } from '../i18n/locales';
import { ImageUploader } from './ImageUploader';
import { Loader2Icon, PencilIcon, DownloadIcon, ImageIcon, UsersIcon, RefreshCwIcon, VideoIcon, MusicIcon } from './IconComponents'; // Assuming RefreshCwIcon and MusicIcon exist or are added
import { UGC_AFFILIATE_BACKGROUNDS } from '../constants';

// --- Helper Components ---
const SelectInput: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {id: string, name_id: string, name_en: string}[], lang: 'id' | 'en', disabled?: boolean }> = ({ label, value, onChange, options, lang, disabled }) => (
    <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
            {label}
        </label>
        <select value={value} onChange={onChange} disabled={disabled} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition appearance-none disabled:opacity-70" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt[lang === 'id' ? 'name_id' : 'name_en']}</option>)}
        </select>
    </div>
);

const TextInput: React.FC<{ label: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }> = ({ label, placeholder, value, onChange, disabled }) => (
     <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{label}</label>
        <input type="text" placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70"/>
    </div>
);

const TextAreaInput: React.FC<{ label: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, disabled?: boolean }> = ({ label, placeholder, value, onChange, disabled }) => (
    <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
            {label}
        </label>
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={4}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm resize-none custom-scrollbar"
        />
    </div>
);


const SceneCard: React.FC<{
    scene: UGCAffiliateScene;
    onRegenerateImage: () => void;
    onGenerateVideo: () => void;
    t: UGCAffiliateDesignerLocale;
    lang: 'id' | 'en';
    isGeneratingAll: boolean;
    generatingSceneId: string | null;
}> = ({ scene, onRegenerateImage, onGenerateVideo, t, lang, isGeneratingAll, generatingSceneId }) => {
    
    const isThisGenerating = generatingSceneId === scene.id;
    const isAnotherGenerating = generatingSceneId !== null && generatingSceneId !== scene.id;

    const renderImageContent = (image: ResultItem) => {
        switch (image.status) {
            case 'empty':
                return <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-800 rounded-t-lg"><ImageIcon /></div>;
            case 'generating':
                return (
                    <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-800 rounded-t-lg relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" />
                        <Loader2Icon />
                    </div>
                );
            case 'completed':
                return <img src={image.data?.imageUrl} alt={scene.id} className="w-full h-full object-cover" />;
            case 'error':
                 return <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-semibold p-2">{t.errorState}</div>;
            default:
                return null;
        }
    };

    const renderVideoOverlay = (video: VideoResultItem) => {
        if (video.status === 'generating') {
            return (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs font-semibold z-10">
                    <Loader2Icon />
                    <span className="mt-2">{t.generatingVideo}</span>
                </div>
            );
        }
         if (video.status === 'completed' && video.videoUrl) {
            return (
                 <a href={video.videoUrl} download={`ugc_video_${scene.id}.mp4`} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors z-20" title={t.downloadVideo}>
                    <DownloadIcon small />
                </a>
            );
        }
        if (video.status === 'error') {
            return (
                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-center text-red-400 text-xs font-semibold z-10 p-2">
                    {t.errorState}: {video.errorMessage}
                </div>
            )
        }
        return null;
    };
    
    const title = lang === 'id' ? scene.title_id : scene.title_en;

    return (
        <div className="bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col">
            <div className="aspect-[9/16] relative rounded-t-lg overflow-hidden bg-black">
                {scene.video.status === 'completed' && scene.video.videoUrl ? (
                    <video src={scene.video.videoUrl} controls loop playsInline className="w-full h-full object-cover z-10" />
                ) : (
                    renderImageContent(scene.image)
                )}
                {renderVideoOverlay(scene.video)}
            </div>
            <div className="p-3">
                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{title}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 h-8 overflow-hidden">{scene.script || (scene.image.status === 'generating' ? '...' : '')}</p>
                 <div className="flex items-center gap-2 mt-3">
                    <button onClick={onRegenerateImage} disabled={isGeneratingAll || isAnotherGenerating || scene.image.status === 'generating' || scene.video.status === 'generating'} className="flex-1 text-xs font-semibold px-2 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-md transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <div className="w-3.5 h-3.5"><RefreshCwIcon /></div>
                        {t.regenerateImage}
                    </button>
                    <button onClick={onGenerateVideo} disabled={isGeneratingAll || isAnotherGenerating || scene.image.status !== 'completed' || scene.video.status === 'generating'} className="flex-1 text-xs font-semibold px-2 py-1.5 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/20 rounded-md transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <div className="w-3.5 h-3.5"><VideoIcon /></div>
                         {t.generateVideo}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UGCAffiliateDesignerProps {
    config: UGCAffiliateConfig;
    onConfigChange: (newConfig: Partial<UGCAffiliateConfig>) => void;
    scenes: UGCAffiliateScene[];
    onScenesChange: React.Dispatch<React.SetStateAction<UGCAffiliateScene[]>>;
    voiceOverAudio: { url: string | null; status: 'empty' | 'generating' | 'completed' | 'error' };
    onVoiceOverAudioChange: React.Dispatch<React.SetStateAction<{ url: string | null; status: 'empty' | 'generating' | 'completed' | 'error' }>>;
    onGenerateAll: () => void;
    onRegenerateSceneImage: (sceneId: UGCAffiliateScene['id']) => void;
    onGenerateSceneVideo: (sceneId: UGCAffiliateScene['id']) => void;
    isGeneratingAll: boolean;
    generatingSceneId: string | null;
    t: UGCAffiliateDesignerLocale;
    lang: 'id' | 'en';
}

// --- Main Component ---
export const UGCAffiliateDesigner: React.FC<UGCAffiliateDesignerProps> = ({
    config, onConfigChange, scenes, onScenesChange, voiceOverAudio, onVoiceOverAudioChange,
    onGenerateAll, onRegenerateSceneImage, onGenerateSceneVideo, isGeneratingAll, generatingSceneId, t, lang
}) => {
    
    const isButtonDisabled = isGeneratingAll || !config.productImage || !config.productName || (config.modelMode === 'upload' && !config.modelImage) || (config.modelMode === 'ai' && !config.modelDescription);

    const imageUploaderT: Omit<ImageUploaderLocale, 'title' | 'subtitle' | 'styleImageTitle' | 'styleImageSubtitle'> = {
        dragAndDrop: 'Upload', fileConstraints: 'Max 10MB', fileError: t.fileError, imagePreviewAlt: 'Preview', removeImage: 'Remove'
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left form */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">1</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step1Title}</h2>
                    </div>
                     <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step1Subtitle}</p>
                     
                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">{t.productImageTitle}</label>
                        <ImageUploader onImageSelect={(file) => onConfigChange({ productImage: file })} onImageRemove={() => onConfigChange({ productImage: null })} sourceImage={config.productImage} t={{ ...imageUploaderT, title: '', subtitle: '', styleImageTitle: '', styleImageSubtitle: '', imagePreviewAlt: 'Product' }} />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">{t.modelModeLabel}</label>
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 text-sm font-bold">
                            <button onClick={() => onConfigChange({ modelMode: 'upload' })} className={`w-full py-1.5 rounded-md transition-colors ${config.modelMode === 'upload' ? 'bg-white dark:bg-neutral-800' : 'text-neutral-600 dark:text-neutral-300'}`}>{t.uploadModel}</button>
                            <button onClick={() => onConfigChange({ modelMode: 'ai' })} className={`w-full py-1.5 rounded-md transition-colors ${config.modelMode === 'ai' ? 'bg-white dark:bg-neutral-800' : 'text-neutral-600 dark:text-neutral-300'}`}>{t.aiModel}</button>
                        </div>
                    </div>
                    
                    {config.modelMode === 'upload' ? (
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">{t.modelImageTitle}</label>
                            <ImageUploader onImageSelect={(file) => onConfigChange({ modelImage: file })} onImageRemove={() => onConfigChange({ modelImage: null })} sourceImage={config.modelImage} t={{ ...imageUploaderT, title: '', subtitle: '', styleImageTitle: '', styleImageSubtitle: '', imagePreviewAlt: 'Model' }} />
                        </div>
                    ) : (
                         <TextAreaInput label={t.modelDescriptionLabel} placeholder={t.modelDescriptionPlaceholder} value={config.modelDescription} onChange={e => onConfigChange({ modelDescription: e.target.value })} disabled={isGeneratingAll} />
                    )}

                    <TextInput label={t.productName} placeholder={t.productNamePlaceholder} value={config.productName} onChange={e => onConfigChange({ productName: e.target.value })} disabled={isGeneratingAll} />
                    <SelectInput label={t.backgroundStyle} value={config.backgroundStyle} onChange={(e) => onConfigChange({ backgroundStyle: e.target.value })} options={UGC_AFFILIATE_BACKGROUNDS} lang={lang} disabled={isGeneratingAll} />
                </div>
                
                 <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">2</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step2Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step2Subtitle}</p>
                    <div className="ml-10">
                        <button onClick={onGenerateAll} disabled={isButtonDisabled} className="w-full bg-gradient-to-r from-lime-500 to-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-lime-600 hover:to-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isGeneratingAll ? (
                                <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>{t.generatingAssets}</span></>
                            ) : (
                                <><div className="w-5 h-5"><UsersIcon /></div><span>{t.generateAssetsButton}</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right result */}
            <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-6">
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step3Title}</h2>
                    </div>
                     <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10 mb-4">{t.step3Subtitle}</p>
                    
                    {/* Voiceover Section */}
                    <div className="mb-6">
                         <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t.voiceoverAudioTitle}</h3>
                         <div className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                             {voiceOverAudio.status === 'generating' && <div className="flex items-center text-sm"><Loader2Icon /><span className="ml-2">{t.generatingAudio}</span></div>}
                             {voiceOverAudio.status === 'completed' && voiceOverAudio.url && (
                                <audio controls src={voiceOverAudio.url} className="w-full h-10" />
                             )}
                             {voiceOverAudio.status === 'error' && <p className="text-xs text-red-500">{t.errorState}</p>}
                         </div>
                    </div>

                    {/* Scene Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {scenes.map(scene => (
                           <SceneCard 
                                key={scene.id} 
                                scene={scene} 
                                onRegenerateImage={() => onRegenerateSceneImage(scene.id)}
                                onGenerateVideo={() => onGenerateSceneVideo(scene.id)}
                                t={t}
                                lang={lang}
                                isGeneratingAll={isGeneratingAll}
                                generatingSceneId={generatingSceneId}
                            />
                        ))}
                    </div>
                     <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-xs">
                        {t.videoGenNotice}
                    </div>
                </div>
            </div>
        </div>
    );
};