

import React, { useState } from 'react';
import type { ResultItem, PosterConfig } from '../types';
import type { PosterDesignerLocale, ImageUploaderLocale } from '../i18n/locales';
import { ImageIcon, PencilIcon, Loader2Icon, EyeIcon, DownloadIcon, CopyIcon, CheckIcon } from './IconComponents';
import { ImageUploader } from './ImageUploader';
import { POSTER_THEMES, COLOR_PALETTES, FONT_STYLES } from '../constants';

interface PosterDesignerProps {
    sourceImages: ResultItem[];
    manualSourceFile: File | null;
    onManualImageSelect: (file: File) => void;
    onManualImageRemove: () => void;
    onGeneratePoster: (selectedImages: ResultItem[], config: PosterConfig) => void;
    isGenerating: boolean;
    isIdentifying: boolean;
    isGeneratingInitialText: boolean;
    posterResults: ResultItem[];
    onPreview: (imageUrl: string) => void;
    onDownloadAll: () => void;
    posterConfig: PosterConfig;
    onPosterConfigChange: <K extends keyof PosterConfig>(key: K, value: PosterConfig[K]) => void;
    t: PosterDesignerLocale;
    t_imageUploader: ImageUploaderLocale;
    lang: 'id' | 'en';
}

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
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm transition disabled:opacity-70"
        />
    </div>
);

const SourceImagesDisplay: React.FC<{ images: ResultItem[], t: PosterDesignerLocale }> = ({ images, t }) => (
    <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">1</span>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.sourceImageTitle}</h2>
        </div>
        <div className="mt-4 grid grid-cols-1">
            {images.map(image => (
                <div key={image.id} className="aspect-square rounded-md overflow-hidden relative border border-neutral-200 dark:border-neutral-700">
                    <img 
                        src={image.upscaledImageUrl || image.data?.imageUrl} 
                        alt={`Source for poster ${image.id}`} 
                        className="w-full h-full object-cover" 
                    />
                </div>
            ))}
        </div>
    </div>
);

const PosterResultCard: React.FC<{ 
    result: ResultItem;
    onPreview: (imageUrl: string) => void;
    t: PosterDesignerLocale;
}> = ({ result, onPreview, t }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!result.data?.prompt) return;
        navigator.clipboard.writeText(result.data.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = () => {
        switch (result.status) {
            case 'empty':
                return (
                    <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                        <div className="text-center text-neutral-400 dark:text-neutral-600">
                             <ImageIcon />
                        </div>
                    </div>
                );
            case 'generating':
                return (
                    <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" />
                        <div className="text-center z-10 absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                            <Loader2Icon />
                        </div>
                    </div>
                );
            case 'error':
                return (
                     <div className="aspect-[3/4] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border-2 border-dashed border-red-200 dark:border-red-500/30 flex items-center justify-center p-2 text-center">
                         <p className="text-xs font-semibold">{t.errorState}</p>
                    </div>
                );
            case 'completed':
                if (!result.data?.imageUrl) return null;
                return (
                     <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white dark:bg-neutral-800 group relative border border-neutral-200 dark:border-neutral-700">
                        <img 
                            src={result.data.imageUrl} 
                            alt={t.altText}
                            className="w-full h-full object-cover"
                        />
                         <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            <button onClick={() => onPreview(result.data!.imageUrl)} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={t.preview}>
                                <EyeIcon small/>
                            </button>
                            <a href={result.data.imageUrl} download={`poster_ai_tools_studio_${Date.now()}.png`} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={t.download}>
                                <DownloadIcon small />
                            </a>
                            <button onClick={handleCopy} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={copied ? t.copied : t.copyPrompt}>
                                {copied ? <CheckIcon small /> : <CopyIcon small />}
                            </button>
                        </div>
                    </div>
                );
        }
    };
    
    return <div>{renderContent()}</div>;
};


export const PosterDesigner: React.FC<PosterDesignerProps> = ({ 
    sourceImages, 
    manualSourceFile, 
    onManualImageSelect, 
    onManualImageRemove, 
    onGeneratePoster, 
    isGenerating, 
    isIdentifying,
    isGeneratingInitialText,
    posterResults, 
    onPreview, 
    onDownloadAll, 
    posterConfig, 
    onPosterConfigChange, 
    t, 
    t_imageUploader, 
    lang 
}) => {
    
    const imageUploaderLocale: ImageUploaderLocale = {
        ...t_imageUploader,
        title: t.uploaderTitle,
        subtitle: t.uploaderSubtitle,
    };
    
    const hasCompletedResults = posterResults.some(r => r.status === 'completed');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left form */}
            <div className="lg:col-span-5 space-y-6">
                 {sourceImages.length > 0 ? (
                    <SourceImagesDisplay images={sourceImages} t={t} />
                 ) : (
                    <ImageUploader
                        onImageSelect={onManualImageSelect}
                        onImageRemove={onManualImageRemove}
                        sourceImage={manualSourceFile}
                        t={imageUploaderLocale}
                        stepNumber="1"
                    />
                 )}

                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">2</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.productNameTitle}</h2>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10 mb-4">{t.productNameSubtitle}</p>
                    <div className="relative ml-10">
                         <input
                            type="text"
                            placeholder={isIdentifying ? t.identifying : t.productNamePlaceholder}
                            value={posterConfig.productName || ''}
                            onChange={(e) => onPosterConfigChange('productName', e.target.value)}
                            disabled={isIdentifying}
                            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70"
                        />
                        {isIdentifying && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2Icon />
                            </div>
                        )}
                    </div>
                </div>


                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.configurePosterTitle}</h2>
                    </div>
                     <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10 mb-4">{t.configurePosterSubtitle}</p>
                     <div className="space-y-4">
                        <SelectInput label={t.posterTheme} value={posterConfig.theme} onChange={(e) => onPosterConfigChange('theme', e.target.value)} options={POSTER_THEMES} lang={lang} disabled={isGenerating} />
                        <SelectInput label={t.colorPalette} value={posterConfig.colorPalette} onChange={(e) => onPosterConfigChange('colorPalette', e.target.value)} options={COLOR_PALETTES} lang={lang} disabled={isGenerating} />
                        <SelectInput label={t.fontStyle} value={posterConfig.fontStyle} onChange={(e) => onPosterConfigChange('fontStyle', e.target.value)} options={FONT_STYLES} lang={lang} disabled={isGenerating} />
                        <TextInput label={t.headline} placeholder={isGeneratingInitialText ? t.generatingInitialText : t.headlinePlaceholder} value={posterConfig.headline} onChange={e => onPosterConfigChange('headline', e.target.value)} disabled={isGenerating || isGeneratingInitialText} />
                        <TextInput label={t.bodyText} placeholder={t.bodyTextPlaceholder} value={posterConfig.bodyText} onChange={e => onPosterConfigChange('bodyText', e.target.value)} disabled={isGenerating || isGeneratingInitialText} />
                        <TextInput label={t.callToAction} placeholder={t.callToActionPlaceholder} value={posterConfig.cta} onChange={e => onPosterConfigChange('cta', e.target.value)} disabled={isGenerating || isGeneratingInitialText} />
                     </div>
                </div>

                <button 
                    onClick={() => onGeneratePoster(sourceImages, posterConfig)}
                    disabled={isGenerating || (sourceImages.length === 0 && !manualSourceFile) || !posterConfig.productName || !posterConfig.headline}
                    className="w-full bg-gradient-to-r from-primary-blue-light to-primary-blue text-white font-semibold py-2.5 px-6 rounded-lg hover:from-primary-blue hover:to-primary-dark transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t.generatingPoster}</span>
                        </>
                    ) : (
                         <>
                            <div className="w-5 h-5"><PencilIcon /></div>
                            <span>{t.generateButton}</span>
                        </>
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
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.posterResultTitle}</h2>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">{t.posterResultSubtitle}</p>
                        </div>
                         {hasCompletedResults && (
                            <button onClick={onDownloadAll} className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                                <DownloadIcon small />
                                <span>{t.downloadAll}</span>
                            </button>
                        )}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {posterResults.map(result => (
                           <PosterResultCard 
                                key={result.id} 
                                result={result} 
                                onPreview={onPreview}
                                t={t}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};