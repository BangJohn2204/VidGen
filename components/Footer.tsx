

import React from 'react';
import { CameraIcon } from './IconComponents';
import type { FooterLocale } from '../i18n/locales';

interface FooterProps {
    onFeaturesClick: () => void;
    onFaqClick: () => void;
    t: FooterLocale;
}

export const Footer: React.FC<FooterProps> = ({ onFeaturesClick, onFaqClick, t }) => {
    return (
        <footer className="bg-neutral-100 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
                    <div className="md:col-span-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 text-primary-blue">
                                <CameraIcon />
                            </div>
                            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{t.brandName}</span>
                        </div>
                        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-sm">
                            {t.brandDescription}
                        </p>
                    </div>
                    
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-neutral-800 dark:text-neutral-200">{t.productTitle}</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <button onClick={onFeaturesClick} className="text-neutral-600 dark:text-neutral-400 hover:text-primary-blue dark:hover:text-primary-blue transition-colors">{t.featuresLink}</button>
                            </li>
                            <li>
                                <button onClick={onFaqClick} className="text-neutral-600 dark:text-neutral-400 hover:text-primary-blue dark:hover:text-primary-blue transition-colors">{t.faqLink}</button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700 text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t.copyright.replace('{year}', new Date().getFullYear().toString())}
                    </p>
                </div>
            </div>
        </footer>
    );
};