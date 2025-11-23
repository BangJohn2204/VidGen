import React, { useState } from 'react';
import type { InteractiveAnimationConfig, InteractiveAnimationScene, ResultItem, VideoResultItem } from '../types';
import type { InteractiveAnimationDesignerLocale, ImageUploaderLocale } from '../i18n/locales';
import { ImageUploader } from './ImageUploader';
import { Loader2Icon, PencilIcon, DownloadIcon, ImageIcon, FilmIcon, VideoIcon, MusicIcon } from './IconComponents';
import { ANIMATION_STYLES, BACKGROUND_ATMOSPHERES } from '../constants';

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

const TextInput: React.FC<{ label?: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean, small?: boolean }> = ({ label, placeholder, value, onChange, disabled, small }) => (
     <div>
        {label && <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{label}</label>}
        <input type="text" placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} className={`w-full bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70 ${small ? 'px-2 py-1.5 text-xs' : 'px-3 py-2.5'}`}/>
    </div>
);

const TextAreaInput: React.FC<{ label?: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, disabled?: boolean, small?: boolean }> = ({ label, placeholder, value, onChange, disabled, small }) => (
    <div>
        {label && <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{label}</label>}
        <textarea placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} rows={small ? 2 : 3} className={`w-full bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 resize-none custom-scrollbar transition disabled:opacity-70 ${small ? 'px-2 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'}`} />
    </div>
);

interface InteractiveAnimationDesignerProps {
    config: InteractiveAnimationConfig;
    onConfigChange: (newConfig: Partial<InteractiveAnimationConfig>) => void;
    scenes: InteractiveAnimationScene[];
    onScenesChange: React.Dispatch<React.SetStateAction<InteractiveAnimationScene[]>>;
    audio: { url: string | null; status: 'empty' | 'generating' | 'completed' | 'error' };
    videoResult: VideoResultItem;
    onGeneratePlan: () => void;
    onGenerateAudio: () => void;
    onGenerateFullVideo: () => void;
    isGeneratingPlan: boolean;
    isGeneratingAudio: boolean;
    isGeneratingVideo: boolean;
    t: InteractiveAnimationDesignerLocale;
    lang: 'id' | 'en';
}

// --- Main Component ---
export const InteractiveAnimationDesigner: React.FC<InteractiveAnimationDesignerProps> = ({
    config, onConfigChange, scenes, onScenesChange, audio, videoResult,
    onGeneratePlan, onGenerateAudio, onGenerateFullVideo,
    isGeneratingPlan, isGeneratingAudio, isGeneratingVideo, t, lang
}) => {
    
    const hasPlan = scenes.some(s => s.previewFrame.status !== 'empty');

    const handleImageUpload = (file: File, index: number) => {
        const newImages = [...config.images];
        newImages[index] = file;
        onConfigChange({ images: newImages });
    };

    const handleImageRemove = (index: number) => {
        const newImages = [...config.images];
        newImages[index] = null;
        onConfigChange({ images: newImages });
    };

    const handleSceneTextChange = (sceneId: string, field: 'headline' | 'subHeadline' | 'cta' | 'voiceOverScript', value: string) => {
        onScenesChange(prevScenes => prevScenes.map(s => s.id === sceneId ? { ...s, [field]: value } : s));
    };

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
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{t.imageUploadTitle}</label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{t.imageUploadSubtitle}</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map(index => (
                                <ImageUploader key={index} onImageSelect={(file) => handleImageUpload(file, index)} onImageRemove={() => handleImageRemove(index)} sourceImage={config.images[index]} t={{ title: '', subtitle: '', dragAndDrop: 'Upload', fileConstraints: '', fileError: t.fileError, imagePreviewAlt: `Image ${index+1}`, removeImage: 'Remove', styleImageTitle: '', styleImageSubtitle: '' }} />
                            ))}
                        </div>
                    </div>

                    <TextInput label={t.contextTitle} placeholder={t.contextPlaceholder} value={config.context} onChange={e => onConfigChange({ context: e.target.value })} disabled={isGeneratingPlan} />
                    
                    <div>
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{t.styleTitle}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{t.styleSubtitle}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <SelectInput label={t.animationStyle} value={config.animationStyle} onChange={(e) => onConfigChange({ animationStyle: e.target.value })} options={ANIMATION_STYLES} lang={lang} disabled={isGeneratingPlan} />
                            <SelectInput label={t.backgroundAtmosphere} value={config.backgroundAtmosphere} onChange={(e) => onConfigChange({ backgroundAtmosphere: e.target.value })} options={BACKGROUND_ATMOSPHERES} lang={lang} disabled={isGeneratingPlan} />
                        </div>
                    </div>
                    
                    <button onClick={onGeneratePlan} disabled={isGeneratingPlan || !config.images.some(img => img) || !config.context} className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-fuchsia-600 hover:to-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGeneratingPlan ? (<><Loader2Icon /><span>{t.generatingPlan}</span></>) : (<><div className="w-5 h-5"><PencilIcon /></div><span>{t.generatePlanButton}</span></>)}
                    </button>
                </div>
            </div>

            {/* Right result area */}
            <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-6">
                 {/* Step 2: Creative Plan */}
                 <div className={`bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 transition-opacity ${!hasPlan && !isGeneratingPlan ? 'hidden' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">2</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step2Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10 mb-4">{t.step2Subtitle}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {scenes.map(scene => (
                            <div key={scene.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 space-y-2">
                                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{lang === 'id' ? scene.title_id : scene.title_en}</h4>
                                <div className="aspect-[9/16] rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                    {scene.previewFrame.status === 'completed' && scene.previewFrame.data ? <img src={scene.previewFrame.data.imageUrl} className="w-full h-full object-cover" /> : <Loader2Icon />}
                                </div>
                                <TextInput small placeholder={t.headline} value={scene.headline} onChange={e => handleSceneTextChange(scene.id, 'headline', e.target.value)} />
                                <TextInput small placeholder={t.subHeadline} value={scene.subHeadline} onChange={e => handleSceneTextChange(scene.id, 'subHeadline', e.target.value)} />
                                <TextInput small placeholder={t.cta} value={scene.cta} onChange={e => handleSceneTextChange(scene.id, 'cta', e.target.value)} />
                                <TextAreaInput small placeholder={t.voiceOverScript} value={scene.voiceOverScript} onChange={e => handleSceneTextChange(scene.id, 'voiceOverScript', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 3: Final Generation */}
                <div className={`bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4 transition-opacity ${!hasPlan ? 'hidden' : 'opacity-100'}`}>
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step3Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step3Subtitle}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MusicIcon/>
                                <h3 className="font-semibold text-sm">Audio Voice Over</h3>
                            </div>
                            {audio.status === 'completed' && audio.url ? <audio controls src={audio.url} className="w-full h-10" /> : <button onClick={onGenerateAudio} disabled={isGeneratingAudio} className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition disabled:opacity-50">{isGeneratingAudio ? t.generatingAudio : t.generateAudioButton}</button>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <VideoIcon/>
                                <h3 className="font-semibold text-sm">Video Final</h3>
                            </div>
                            <button onClick={onGenerateFullVideo} disabled={isGeneratingVideo || audio.status !== 'completed'} className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-primary-blue text-white hover:bg-primary-dark transition disabled:opacity-50">{isGeneratingVideo ? t.generatingVideo : t.generateVideoButton}</button>
                        </div>
                    </div>

                    <div className="aspect-[9/16] bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center relative overflow-hidden">
                        {isGeneratingVideo && (<div className="text-center z-10 p-4"><Loader2Icon /><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 font-medium drop-shadow-md">{t.generatingVideo}</p></div>)}
                        {videoResult.status === 'empty' && !isGeneratingVideo && (<div className="text-center text-neutral-400 dark:text-neutral-600"><div className="w-12 h-12 mx-auto"><FilmIcon /></div><p className="mt-2 text-sm">{t.videoResultEmpty}</p></div>)}
                        {videoResult.status === 'completed' && videoResult.videoUrl && (<video src={videoResult.videoUrl} controls className="w-full h-full object-contain bg-black rounded-lg" />)}
                        {videoResult.status === 'error' && (<div className="text-center text-red-700 dark:text-red-300 p-4"><p className="text-sm font-semibold">{t.errorState}</p><p className="text-xs">{videoResult.errorMessage}</p></div>)}
                    </div>
                     {videoResult.status === 'completed' && videoResult.videoUrl && (
                        <a href={videoResult.videoUrl} download={`animation_${Date.now()}.mp4`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                            <DownloadIcon small />
                            <span>{t.downloadFinalVideo}</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
