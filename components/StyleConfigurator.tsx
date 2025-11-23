

import React, { useMemo } from 'react';
import type { GenerationConfig, ProductType } from '../types';
import { 
    MARKETING_PRODUCT_TYPES, 
    FOOD_PHOTOGRAPHY_PRODUCT_TYPES,
    PORTRAIT_SUBJECT_TYPES,
    OTHER_OPTION,
    StyleOption,
    getProductCategory,
    optionsByCategory,
} from '../constants';
import { MessageSquareIcon, ShieldIcon } from './IconComponents';
import type { StyleConfiguratorLocale } from '../i18n/locales';

interface StyleConfiguratorProps {
    config: GenerationConfig;
    onConfigChange: <K extends keyof GenerationConfig>(key: K, value: GenerationConfig[K]) => void;
    t: StyleConfiguratorLocale;
    lang: 'id' | 'en';
    view: 'marketing' | 'food' | 'portrait';
    isLoading: boolean;
}

const SelectInput: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: StyleOption[], lang: 'id' | 'en', disabled?: boolean }> = ({ label, value, onChange, options, lang, disabled }) => (
    <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
            {label}
        </label>
        <select 
            value={value} 
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
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

const CustomInput: React.FC<{ placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ placeholder, value, onChange }) => (
    <div className="mt-2">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm transition"
        />
    </div>
);

export const StyleConfigurator: React.FC<StyleConfiguratorProps> = ({ config, onConfigChange, t, lang, view, isLoading }) => {
    
    const productTypeOptions = useMemo(() => {
        if (view === 'food') return FOOD_PHOTOGRAPHY_PRODUCT_TYPES;
        if (view === 'portrait') return PORTRAIT_SUBJECT_TYPES;
        return MARKETING_PRODUCT_TYPES;
    }, [view]);
    
    const category = useMemo(() => getProductCategory(config.photoType), [config.photoType]);

    const { angles, lighting, styling, backgrounds, outfits } = useMemo(() => {
        return optionsByCategory[category];
    }, [category]);

    const showCustomBackground = config.backgroundStyle === OTHER_OPTION.id;

    const handlePhotoTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as ProductType;
        const newCategory = getProductCategory(newType);
        const newOptions = optionsByCategory[newCategory];

        onConfigChange('photoType', newType);
        onConfigChange('angleStyle', newOptions.angles[0].id);
        onConfigChange('lightingStyle', newOptions.lighting[0].id);
        onConfigChange('stylingStyle', newOptions.styling[0].id);
        onConfigChange('backgroundStyle', newOptions.backgrounds[0].id);
        onConfigChange('outfitStyle', newOptions.outfits.length > 0 ? newOptions.outfits[0].id : '');
    };

    return (
        <div id="tour-step-style-config" className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
             <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">3</span>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
            </div>
             <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10 -mt-4 mb-6">
                {t.subtitle}
            </p>
            
            <div className="space-y-4">
                <div>
                    <SelectInput 
                        label={view === 'food' ? t.foodType : t.photoType}
                        value={config.photoType}
                        onChange={handlePhotoTypeChange}
                        options={productTypeOptions}
                        lang={lang}
                        disabled={isLoading}
                    />
                </div>
                
                {view === 'portrait' && outfits && outfits.length > 0 && (
                    <SelectInput
                        label={t.outfitStyle}
                        value={config.outfitStyle || ''}
                        onChange={(e) => onConfigChange('outfitStyle', e.target.value)}
                        options={outfits}
                        lang={lang}
                    />
                )}
                
                <SelectInput 
                    label={t.angleStyle}
                    value={config.angleStyle || ''}
                    onChange={(e) => onConfigChange('angleStyle', e.target.value)}
                    options={angles}
                    lang={lang}
                />
                <SelectInput 
                    label={t.lightingStyle}
                    value={config.lightingStyle || ''}
                    onChange={(e) => onConfigChange('lightingStyle', e.target.value)}
                    options={lighting}
                    lang={lang}
                />
                <SelectInput 
                    label={t.stylingStyle}
                    value={config.stylingStyle || ''}
                    onChange={(e) => onConfigChange('stylingStyle', e.target.value)}
                    options={styling}
                    lang={lang}
                />
                
                <div>
                    <SelectInput 
                        label={t.backgroundStyle}
                        value={config.backgroundStyle}
                        onChange={(e) => onConfigChange('backgroundStyle', e.target.value)}
                        options={backgrounds}
                        lang={lang}
                    />
                    {showCustomBackground && (
                        <CustomInput
                            placeholder={t.customBackgroundPlaceholder}
                            value={config.customBackgroundStyle || ''}
                            onChange={(e) => onConfigChange('customBackgroundStyle', e.target.value)}
                        />
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block flex items-center">
                      <MessageSquareIcon />
                      <span className="ml-1.5">{t.extraInstructions}</span>
                    </label>
                    <textarea
                      placeholder={t.extraInstructionsPlaceholder}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm resize-none custom-scrollbar"
                      rows={3}
                      value={config.extraInstructions}
                      onChange={(e) => onConfigChange('extraInstructions', e.target.value)}
                    />
                </div>
                 <div className="pt-2">
                    <label htmlFor="watermark-toggle" className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center">
                            <ShieldIcon checked={!config.withWatermark || (config.withWatermark && !!config.customWatermarkText)} />
                            <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.useCustomWatermark}</span>
                        </span>
                        <div className="relative">
                            <input 
                                id="watermark-toggle" 
                                type="checkbox" 
                                className="sr-only" 
                                checked={config.withWatermark}
                                onChange={(e) => onConfigChange('withWatermark', e.target.checked)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition ${config.withWatermark ? 'bg-primary-blue' : 'bg-neutral-200 dark:bg-neutral-600'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.withWatermark ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 ml-7">{t.useCustomWatermarkTooltip}</p>
                    {config.withWatermark && (
                        <div className="mt-2">
                            <input
                                type="text"
                                placeholder={t.customWatermarkPlaceholder}
                                value={config.customWatermarkText || ''}
                                onChange={(e) => onConfigChange('customWatermarkText', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 text-sm transition"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};