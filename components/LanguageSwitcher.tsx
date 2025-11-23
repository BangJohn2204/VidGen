import React from 'react';

interface LanguageSwitcherProps {
    currentLang: 'id' | 'en';
    toggleLang: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, toggleLang }) => {
    return (
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 text-sm font-bold">
            <button
                onClick={() => { if (currentLang !== 'id') toggleLang(); }}
                className={`px-3 py-1 rounded-full transition-colors duration-300 ${currentLang === 'id' ? 'bg-primary-blue text-white' : 'text-neutral-600 dark:text-neutral-300'}`}
                aria-pressed={currentLang === 'id'}
            >
                ID
            </button>
            <button
                onClick={() => { if (currentLang !== 'en') toggleLang(); }}
                className={`px-3 py-1 rounded-full transition-colors duration-300 ${currentLang === 'en' ? 'bg-primary-blue text-white' : 'text-neutral-600 dark:text-neutral-300'}`}
                aria-pressed={currentLang === 'en'}
            >
                EN
            </button>
        </div>
    );
};