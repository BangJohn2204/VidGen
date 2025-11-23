

import React from 'react';
import type { ResultItem, AppSettings } from '../types';
import { DownloadIcon, ImageIcon, CopyIcon, CheckIcon, Loader2Icon, ArrowUpIcon, EyeIcon, LayoutGridIcon } from './IconComponents';
import type { ResultsGridLocale } from '../i18n/locales';

interface ResultsGridProps {
    results: ResultItem[];
    onDownloadAll: () => void;
    onUpscaleAll: () => void;
    onPreview: (imageUrl: string) => void;
    isUpscaling: boolean;
    aspectRatio: AppSettings['aspectRatio'];
    t: ResultsGridLocale;
    activeView: 'marketing' | 'food' | 'portrait' | 'poster';
    selectedImageId: number | null;
    onSelectImage: (id: number) => void;
    onContinueToPoster: () => void;
}

const getAspectRatioClass = (ratio: AppSettings['aspectRatio']) => {
    switch (ratio) {
        case '4:5': return 'aspect-[4/5]';
        case '9:16': return 'aspect-[9/16]';
        case '1:1':
        default: return 'aspect-square';
    }
};

const ResultCard: React.FC<{ 
    result: ResultItem; 
    aspectRatio: AppSettings['aspectRatio']; 
    onPreview: (imageUrl: string) => void; 
    t: ResultsGridLocale;
    isSelected: boolean;
    onSelectImage: (id: number) => void;
}> = ({ result, aspectRatio, onPreview, t, isSelected, onSelectImage }) => {
    const [copied, setCopied] = React.useState(false);
    const aspectRatioClass = getAspectRatioClass(aspectRatio);

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
                    <div className={`${aspectRatioClass} bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center`}>
                        <div className="text-center">
                            <ImageIcon />
                        </div>
                    </div>
                );
            
            case 'generating':
            case 'upscaling':
                 return (
                    <div className={`${aspectRatioClass} bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center relative overflow-hidden`}>
                        {result.data?.imageUrl && <img src={result.data.imageUrl} alt={t.altText} className="w-full h-full object-cover blur-sm brightness-90" />}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" />
                        <div className="text-center z-10 absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                            <Loader2Icon />
                            <p className="mt-2 text-xs text-white font-medium drop-shadow-md">
                                {result.status === 'generating' ? t.generatingState : t.upscalingState}
                            </p>
                        </div>
                    </div>
                );

            case 'error':
                return (
                     <div className={`${aspectRatioClass} bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border-2 border-dashed border-red-200 dark:border-red-500/30 flex items-center justify-center p-4`}>
                        <div className="text-center">
                            <p className="text-xs font-semibold">{t.errorState}</p>
                        </div>
                    </div>
                );

            case 'completed':
                if (!result.data) return null;
                const imageUrl = result.upscaledImageUrl || result.data.imageUrl;
                const isUpscaled = !!result.upscaledImageUrl;
                return (
                    <div 
                        className={`rounded-lg overflow-hidden bg-white dark:bg-neutral-800 flex flex-col group relative border-2 transition-all ${isSelected ? 'border-primary-blue ring-2 ring-primary-blue/50' : 'border-neutral-200 dark:border-neutral-700'}`}
                    >
                         {isSelected && (
                            <div className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center bg-primary-blue rounded-full text-white border-2 border-white dark:border-neutral-800">
                                <CheckIcon small />
                            </div>
                        )}
                        <div className={`relative ${aspectRatioClass}`}>
                           {isUpscaled && (
                                <div className="absolute top-2 left-2 z-10 bg-primary-blue/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {t.upscaled}
                                </div>
                            )}
                            <img 
                                src={imageUrl} 
                                alt={t.altText}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); onPreview(imageUrl); }} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={t.preview}>
                                    <EyeIcon small/>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onSelectImage(result.id); }} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={t.selectForPoster}>
                                    <LayoutGridIcon small />
                                </button>
                                <a href={imageUrl} download={`ai_tools_studio_${Date.now()}.png`} onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={t.download}>
                                    <DownloadIcon small />
                                </a>
                                <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors" title={copied ? t.copied : t.copyPrompt}>
                                    {copied ? <CheckIcon small /> : <CopyIcon small />}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            
            default: return null;
        }
    };
    
    return <div>{renderContent()}</div>;
};

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, onDownloadAll, onUpscaleAll, onPreview, isUpscaling, t, aspectRatio, activeView, selectedImageId, onSelectImage, onContinueToPoster }) => {
    const hasCompletedResults = results.some(r => r.status === 'completed');
    const hasUpscalableResults = results.some(r => r.status === 'completed' && !r.upscaledImageUrl);

    const gridClasses = 'grid grid-cols-2 gap-4';

    return (
        <div id="tour-step-results-grid" className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-start justify-between mb-6">
                 <div>
                    <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">4</span>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                    </div>
                     <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">
                        {t.subtitle}
                    </p>
                </div>
                {hasCompletedResults && (
                    <button onClick={onDownloadAll} className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                        <DownloadIcon small />
                        <span>{t.downloadAll}</span>
                    </button>
                )}
            </div>
            
            <div className={gridClasses}>
                {results.map((result) => (
                    <ResultCard 
                        key={result.id} 
                        result={result} 
                        aspectRatio={aspectRatio} 
                        onPreview={onPreview} 
                        t={t}
                        isSelected={selectedImageId === result.id}
                        onSelectImage={onSelectImage}
                    />
                ))}
            </div>

            {hasUpscalableResults && (
                <div className="mt-6">
                    <button
                        onClick={onUpscaleAll}
                        disabled={isUpscaling}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpscaling ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t.upscalingState}</span>
                            </>
                        ) : (
                            <>
                                <ArrowUpIcon />
                                <span>{t.upscaleAll}</span>
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {(activeView === 'marketing' || activeView === 'food') && hasCompletedResults && (
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-base">{t.readyForMarketingTitle}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-4">{t.readyForMarketingDesc}</p>
                    <button 
                        onClick={onContinueToPoster}
                        disabled={selectedImageId === null}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-blue-light to-primary-blue text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        <div className="w-5 h-5"><LayoutGridIcon /></div>
                        <span>{t.continueToPosterButton.replace('{count}', selectedImageId === null ? '0' : '1')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};