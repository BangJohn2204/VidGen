

import React from 'react';
import type { ProductNameInputLocale } from '../i18n/locales';
import { Loader2Icon } from './IconComponents';

interface ProductNameInputProps {
    value: string;
    onChange: (value: string) => void;
    t: ProductNameInputLocale;
    view: 'marketing' | 'food' | 'portrait';
    isLoading: boolean;
}

export const ProductNameInput: React.FC<ProductNameInputProps> = ({ value, onChange, t, view, isLoading }) => {
    const placeholder = view === 'food' ? t.foodPlaceholder : t.placeholder;

    return (
        <div id="tour-step-product-name" className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">2</span>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">
                    {t.subtitle}
                </p>
            </div>
            <div className="px-6 pb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={isLoading ? t.identifying : placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-neutral-900 dark:text-neutral-100 transition disabled:opacity-70"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2Icon />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};