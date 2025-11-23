

import React from 'react';
import type { UGCVideoConfig, VideoResultItem } from '../types';
import type { UGCVideographyDesignerLocale } from '../i18n/locales';
import { ImageUploader } from './ImageUploader';
import { Loader2Icon, VideoIcon, PencilIcon, DownloadIcon, SparklesIcon } from './IconComponents';
import { UGC_TONE_OPTIONS } from '../constants';

interface UGCVideographyDesignerProps {
    config: UGCVideoConfig;
    onConfigChange: <K extends keyof UGCVideoConfig>(key: K, value: UGCVideoConfig[K]) => void;
    onGenerate: () => void;
    onGenerateHook: () => void;
    isGeneratingPrompt: boolean;
    isGeneratingVideo: boolean;
    isGeneratingHook: boolean;
    result: VideoResultItem;
    t: UGCVideographyDesignerLocale;
    lang: 'id' | 'en';
}

const TextInput: React.FC<{ label: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }> = ({ label, placeholder, value, onChange, disabled }) => (
    <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
            {label}
        </label>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70"
        />
    </div>
);

const SelectInput: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {id: string, name_id: string, name_en: string}[], lang: 'id' | 'en', disabled?: boolean }> = ({ label, value, onChange, options, lang, disabled }) => (
    <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
            {label}
        </label>
        <select 
            value={value} 
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition appearance-none disabled:opacity-70"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
        >
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt[lang === 'id' ? 'name_id' : 'name_en']}</option>)}
        </select>
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
            rows={3}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm resize-none custom-scrollbar"
        />
    </div>
);


export const UGCVideographyDesigner: React.FC<UGCVideographyDesignerProps> = ({
    config, onConfigChange, onGenerate, onGenerateHook, isGeneratingPrompt, isGeneratingVideo, isGeneratingHook, result, t, lang
}) => {

    const isGenerating = isGeneratingPrompt || isGeneratingVideo;
    const isButtonDisabled = isGenerating || !config.productName || (config.modelMode === 'upload' && !config.modelImage) || (config.modelMode === 'ai' && !config.modelDescription);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left form */}
            <div className="lg:col-span-5 space-y-6">
                {/* Step 1 */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">1</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step1Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step1Subtitle}</p>
                    
                    <TextInput label={t.productNameLabel} placeholder={t.productNamePlaceholder} value={config.productName} onChange={e => onConfigChange('productName', e.target.value)} disabled={isGenerating} />
                    
                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{t.productImageLabel}</label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{t.productImageSubtitle}</p>
                        <ImageUploader
                            onImageSelect={(file) => onConfigChange('productImage', file)}
                            onImageRemove={() => onConfigChange('productImage', null)}
                            sourceImage={config.productImage}
                            t={{ title: '', subtitle: '', dragAndDrop: 'Upload', fileConstraints: 'Max 10MB', fileError: t.fileError, imagePreviewAlt: 'Product', removeImage: 'Remove', styleImageTitle: '', styleImageSubtitle: '' }}
                        />
                    </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">2</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step2Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step2Subtitle}</p>

                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">{t.modelModeLabel}</label>
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 text-sm font-bold">
                            <button onClick={() => onConfigChange('modelMode', 'upload')} className={`w-full py-1.5 rounded-md transition-colors ${config.modelMode === 'upload' ? 'bg-white dark:bg-neutral-800' : 'text-neutral-600 dark:text-neutral-300'}`}>{t.uploadModel}</button>
                            <button onClick={() => onConfigChange('modelMode', 'ai')} className={`w-full py-1.5 rounded-md transition-colors ${config.modelMode === 'ai' ? 'bg-white dark:bg-neutral-800' : 'text-neutral-600 dark:text-neutral-300'}`}>{t.aiModel}</button>
                        </div>
                    </div>
                    
                    {config.modelMode === 'upload' ? (
                         <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">{t.modelImageLabel}</label>
                             <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{t.modelImageSubtitle}</p>
                            <ImageUploader
                                onImageSelect={(file) => onConfigChange('modelImage', file)}
                                onImageRemove={() => onConfigChange('modelImage', null)}
                                sourceImage={config.modelImage}
                                t={{ title: '', subtitle: '', dragAndDrop: 'Upload Model', fileConstraints: 'Max 10MB', fileError: t.fileError, imagePreviewAlt: 'Model', removeImage: 'Remove', styleImageTitle: '', styleImageSubtitle: '' }}
                            />
                        </div>
                    ) : (
                        <TextAreaInput label={t.modelDescriptionLabel} placeholder={t.modelDescriptionPlaceholder} value={config.modelDescription} onChange={e => onConfigChange('modelDescription', e.target.value)} disabled={isGenerating} />
                    )}
                </div>

                {/* Step 3 */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step3Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step3Subtitle}</p>
                    <TextInput label={t.targetAudienceLabel} placeholder={t.targetAudiencePlaceholder} value={config.targetAudience} onChange={e => onConfigChange('targetAudience', e.target.value)} disabled={isGenerating} />
                    <SelectInput label={t.toneLabel} value={config.tone} onChange={(e) => onConfigChange('tone', e.target.value)} options={UGC_TONE_OPTIONS} lang={lang} disabled={isGenerating} />
                     <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                            {t.overlayHookLabel}
                        </label>
                        <div className="flex items-center gap-2">
                             <input
                                type="text"
                                placeholder={t.overlayHookPlaceholder}
                                value={config.overlayHook}
                                onChange={e => onConfigChange('overlayHook', e.target.value)}
                                disabled={isGenerating}
                                className="flex-1 w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70"
                            />
                            <button onClick={onGenerateHook} disabled={isGenerating || isGeneratingHook || !config.productName} className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-lg hover:bg-primary-blue/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isGeneratingHook ? <Loader2Icon/> : <div className="w-5 h-5"><SparklesIcon/></div>}
                            </button>
                        </div>
                    </div>
                </div>

                <button onClick={onGenerate} disabled={isButtonDisabled} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGenerating ? (
                        <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>{isGeneratingPrompt ? t.generatingPrompt : t.generatingVideo}</span></>
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
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step4Title}</h2>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">{t.step4Subtitle}</p>
                        </div>
                        {result.status === 'completed' && result.videoUrl && (
                            <a href={result.videoUrl} download={`ugc_video_${Date.now()}.mp4`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                                <DownloadIcon small />
                                <span>{t.downloadVideo}</span>
                            </a>
                        )}
                    </div>

                    <div className="aspect-[9/16] bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center relative overflow-hidden">
                        {(isGeneratingPrompt || isGeneratingVideo) && (
                            <div className="text-center z-10 p-4">
                                <Loader2Icon />
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 font-medium drop-shadow-md">
                                    {isGeneratingPrompt ? t.generatingPrompt : t.generatingVideo}
                                </p>
                            </div>
                        )}
                        {result.status === 'empty' && !(isGeneratingPrompt || isGeneratingVideo) && (
                            <div className="text-center text-neutral-400 dark:text-neutral-600">
                                <div className="w-12 h-12 mx-auto"><VideoIcon /></div>
                                <p className="mt-2 text-sm">{t.videoResultEmpty}</p>
                            </div>
                        )}
                        {result.status === 'completed' && result.videoUrl && (
                            <video src={result.videoUrl} controls className="w-full h-full object-contain bg-black rounded-lg" />
                        )}
                        {result.status === 'error' && (
                            <div className="text-center text-red-700 dark:text-red-300 p-4">
                                <p className="text-sm font-semibold">{t.errorState}</p>
                                <p className="text-xs">{result.errorMessage}</p>
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