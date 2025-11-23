
import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import type { SettingsModalLocale } from '../i18n/locales';
import { XIcon } from './IconComponents';
import { defaultSettings } from '../App';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSettingsChange: (newSettings: Partial<AppSettings>) => void;
    t: SettingsModalLocale;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, t }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [isOpen, settings]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSettingsChange(localSettings);
        onClose();
    };

    const handleReset = () => {
        if (window.confirm(t.resetConfirm)) {
            // FIX: 'apiMode' is deprecated and removed from AppSettings.
            // Resetting should use the defaultSettings object directly.
            setLocalSettings(defaultSettings);
            onSettingsChange(defaultSettings);
            onClose();
        }
    };

    const handleValueChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                        <XIcon />
                    </button>
                </div>
                 <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                    {/* Appearance */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t.appearanceTitle}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.language}</label>
                                <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 text-sm font-bold mt-2">
                                    <button onClick={() => handleValueChange('language', 'id')} className={`w-full py-1 rounded-md transition-colors ${localSettings.language === 'id' ? 'bg-primary-blue text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>{t.id}</button>
                                    <button onClick={() => handleValueChange('language', 'en')} className={`w-full py-1 rounded-md transition-colors ${localSettings.language === 'en' ? 'bg-primary-blue text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>{t.en}</button>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.theme}</label>
                                <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 text-sm font-bold mt-2">
                                    <button onClick={() => handleValueChange('theme', 'light')} className={`w-full py-1 rounded-md transition-colors ${localSettings.theme === 'light' ? 'bg-white' : ''}`}>{t.light}</button>
                                    <button onClick={() => handleValueChange('theme', 'dark')} className={`w-full py-1 rounded-md transition-colors ${localSettings.theme === 'dark' ? 'bg-neutral-900 text-white' : ''}`}>{t.dark}</button>
                                </div>
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.aspectRatio}</label>
                            <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 text-sm font-bold mt-2">
                                <button onClick={() => handleValueChange('aspectRatio', '1:1')} className={`w-full py-1 rounded-md transition-colors ${localSettings.aspectRatio === '1:1' ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'}`}>1:1</button>
                                <button onClick={() => handleValueChange('aspectRatio', '4:5')} className={`w-full py-1 rounded-md transition-colors ${localSettings.aspectRatio === '4:5' ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'}`}>4:5</button>
                                <button onClick={() => handleValueChange('aspectRatio', '9:16')} className={`w-full py-1 rounded-md transition-colors ${localSettings.aspectRatio === '9:16' ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-300'}`}>9:16</button>
                            </div>
                        </div>
                    </div>
                    {/* Generation */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t.generationTitle}</h3>
                        <div>
                             <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.numberOfImages}</label>
                             <div className="mt-2 text-center">
                                <span className="text-3xl font-bold text-primary-blue">{localSettings.numberOfResults}</span>
                                <span className="ml-1 text-neutral-500">{t.images}</span>
                             </div>
                             <input
                                type="range"
                                min="2"
                                max="6"
                                step="2"
                                value={localSettings.numberOfResults}
                                onChange={(e) => handleValueChange('numberOfResults', parseInt(e.target.value, 10) as 2|4|6)}
                                className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer mt-2 accent-primary-blue"
                            />
                            <div className="flex justify-between text-xs text-neutral-500 px-1">
                                <span>2</span>
                                <span>4</span>
                                <span>6</span>
                            </div>
                        </div>
                    </div>
                    {/* Defaults */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t.defaultsTitle}</h3>
                         <div>
                            <label htmlFor="watermark-toggle" className="flex items-center justify-between cursor-pointer">
                                <span className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.defaultWatermark}</span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.defaultWatermarkDesc}</span>
                                </span>
                                <div className="relative">
                                    <input id="watermark-toggle" type="checkbox" className="sr-only" checked={localSettings.defaultWatermark} onChange={(e) => handleValueChange('defaultWatermark', e.target.checked)} />
                                    <div className={`block w-10 h-6 rounded-full transition ${localSettings.defaultWatermark ? 'bg-primary-blue' : 'bg-neutral-200 dark:bg-neutral-600'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localSettings.defaultWatermark ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                     <button onClick={handleReset} className="px-5 py-2 rounded-lg text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                        {t.reset}
                    </button>
                     <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary-blue hover:bg-primary-dark text-white transition-colors">
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
};