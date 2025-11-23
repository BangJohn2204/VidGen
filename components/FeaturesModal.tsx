import React from 'react';
import { XIcon, WandIcon } from './IconComponents';
import type { FeaturesModalLocale } from '../i18n/locales';

interface FeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: FeaturesModalLocale;
}

export const FeaturesModal: React.FC<FeaturesModalProps> = ({ isOpen, onClose, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                        <XIcon />
                    </button>
                </div>
                 <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {t.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue mt-1">
                                    <WandIcon />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{feature.title}</h3>
                                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
                     <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary-blue hover:bg-primary-dark text-white transition-colors">
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};