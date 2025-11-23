


import React from 'react';
import type { UGCSoundVideoConfig, VideoResultItem } from '../types';
import type { UGCSoundVideographyDesignerLocale } from '../i18n/locales';
import { ImageUploader } from './ImageUploader';
import { Loader2Icon, VideoIcon, PencilIcon, DownloadIcon } from './IconComponents';
import { UGC_TONE_OPTIONS, VOICE_GENDER_OPTIONS } from '../constants';

interface UGCSoundVideographyDesignerProps {
    config: UGCSoundVideoConfig;
    onConfigChange: <K extends keyof UGCSoundVideoConfig>(key: K, value: UGCSoundVideoConfig[K]) => void;
    onGenerate: () => void;
    onProductImageSelect: (file: File) => void;
    isAnalyzing: boolean;
    isGeneratingVideo: boolean;
    result: VideoResultItem;
    t: UGCSoundVideographyDesignerLocale;
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


export const UGCSoundVideographyDesigner: React.FC<UGCSoundVideographyDesignerProps> = ({
    config, onConfigChange, onGenerate, onProductImageSelect, isAnalyzing, isGeneratingVideo, result, t, lang
}) => {

    const isButtonDisabled = isGeneratingVideo || !config.productImage || !config.hookText || isAnalyzing;
    const isStep2Disabled = !config.productImage || isAnalyzing;

    const handleImageRemove = () => {
        onConfigChange('productImage', null);
        // Also clear the analysis results
        onConfigChange('productName', '');
        onConfigChange('productCategory', '');
        onConfigChange('productBenefits', '');
        onConfigChange('productUsp', '');
        onConfigChange('targetAudience', '');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left form */}
            <div className="lg:col-span-5 space-y-6">
                 {/* Step 1: Upload & Analyze */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">1</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step1Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10 mb-4">{t.step1Subtitle}</p>
                    <div className="ml-10">
                        <ImageUploader
                            onImageSelect={onProductImageSelect}
                            onImageRemove={handleImageRemove}
                            sourceImage={config.productImage}
                            t={{ title: '', subtitle: '', dragAndDrop: 'Upload Product', fileConstraints: 'Max 10MB', fileError: t.fileError, imagePreviewAlt: 'Product', removeImage: 'Remove', styleImageTitle: '', styleImageSubtitle: '' }}
                        />
                        {isAnalyzing && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                <Loader2Icon />
                                <span>{t.analyzingProduct}</span>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Step 2: Review & Adjust */}
                <div className={`bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4 transition-opacity ${isStep2Disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">2</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step2Title}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-3 ml-10">{t.step2Subtitle}</p>

                    <div className="space-y-4 ml-10">
                        <TextInput label={t.productName} placeholder={t.productNamePlaceholder} value={config.productName} onChange={e => onConfigChange('productName', e.target.value)} />
                        <TextInput label={t.productCategory} placeholder={t.productCategoryPlaceholder} value={config.productCategory} onChange={e => onConfigChange('productCategory', e.target.value)} />
                        <TextInput label={t.productBenefits} placeholder={t.productBenefitsPlaceholder} value={config.productBenefits} onChange={e => onConfigChange('productBenefits', e.target.value)} />
                        <TextInput label={t.productUsp} placeholder={t.productUspPlaceholder} value={config.productUsp} onChange={e => onConfigChange('productUsp', e.target.value)} />
                        <TextInput label={t.targetAudience} placeholder={t.targetAudiencePlaceholder} value={config.targetAudience} onChange={e => onConfigChange('targetAudience', e.target.value)} />
                        <SelectInput label={t.tone} value={config.tone} onChange={(e) => onConfigChange('tone', e.target.value)} options={UGC_TONE_OPTIONS} lang={lang} />
                        <SelectInput label={t.voiceGender} value={config.voiceGender} onChange={e => onConfigChange('voiceGender', e.target.value as 'pria' | 'wanita')} options={VOICE_GENDER_OPTIONS} lang={lang} />
                        <TextInput label={t.hookText} placeholder={t.hookTextPlaceholder} value={config.hookText} onChange={e => onConfigChange('hookText', e.target.value)} />
                        <TextInput label={t.benefitSentence} placeholder={t.benefitSentencePlaceholder} value={config.shortBenefitSentence} onChange={e => onConfigChange('shortBenefitSentence', e.target.value)} />
                        <TextInput label={t.ctaText} placeholder={t.ctaTextPlaceholder} value={config.shortCtaText} onChange={e => onConfigChange('shortCtaText', e.target.value)} />
                    </div>
                </div>

                <button onClick={onGenerate} disabled={isButtonDisabled} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-sky-600 hover:to-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGeneratingVideo ? (
                        <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>{t.generatingVideo}</span></>
                    ) : (
                        <><div className="w-5 h-5"><PencilIcon /></div><span>{t.generateButton}</span></>
                    )}
                </button>
            </div>

            {/* Right result */}
            <div className="lg:col-span-7 lg:sticky lg:top-6">
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                     <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3"><span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span><h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.step3Title}</h2></div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">{t.step3Subtitle}</p>
                        </div>
                        {result.status === 'completed' && result.videoUrl && (
                            <a href={result.videoUrl} download={`ugc_sound_video_${Date.now()}.mp4`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                                <DownloadIcon small />
                                <span>{t.downloadVideo}</span>
                            </a>
                        )}
                    </div>

                    <div className="aspect-[9/16] bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center relative overflow-hidden">
                        {isGeneratingVideo && (
                            <div className="text-center z-10 p-4">
                                <Loader2Icon />
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 font-medium drop-shadow-md">{t.generatingVideo}</p>
                            </div>
                        )}
                        {result.status === 'empty' && !isGeneratingVideo && (
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
