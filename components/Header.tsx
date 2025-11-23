


import React from 'react';
import { CubeIcon, SunIcon, MoonIcon, UtensilsIcon, UserIcon, SettingsIcon, LayoutGridIcon, ArrowLeftIcon, QuestionMarkCircleIcon, VideoIcon, SmartphoneIcon, UgcSoundIcon, UsersIcon, FilmIcon } from './IconComponents';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { HeaderLocale } from '../i18n/locales';
import type { AppSettings } from '../types';

type ActiveView = 'marketing' | 'food' | 'portrait' | 'poster' | 'videography' | 'ugcVideography' | 'ugcSoundVideography' | 'ugcAffiliate' | 'interactiveAnimation';
interface HeaderProps {
    title: string;
    activeView: ActiveView;
    settings: AppSettings;
    onSettingsChange: (changes: Partial<AppSettings>) => void;
    t: HeaderLocale;
    onGoBack?: () => void;
    onStartTour?: () => void;
}

const getIconForView = (view: ActiveView) => {
    switch (view) {
        case 'food': return <UtensilsIcon />;
        case 'portrait': return <UserIcon />;
        case 'poster': return <LayoutGridIcon />;
        case 'videography': return <VideoIcon />;
        case 'ugcVideography': return <SmartphoneIcon />;
        case 'ugcSoundVideography': return <UgcSoundIcon />;
        case 'ugcAffiliate': return <UsersIcon />;
        case 'interactiveAnimation': return <FilmIcon />;
        case 'marketing':
        default: return <CubeIcon />;
    }
};


export const Header: React.FC<HeaderProps> = ({ title, activeView, settings, onSettingsChange, t, onGoBack, onStartTour }) => {
    const titleParts = title.split(' ');
    const lastWord = titleParts.pop();
    const mainTitle = titleParts.join(' ');

    const toggleTheme = () => {
        onSettingsChange({ theme: settings.theme === 'light' ? 'dark' : 'light' });
    };

    const toggleLanguage = () => {
        onSettingsChange({ language: settings.language === 'id' ? 'en' : 'id' });
    }

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center gap-3">
                         {onGoBack && (
                            <button onClick={onGoBack} className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 mr-2" aria-label={t.goBack}>
                                <ArrowLeftIcon />
                            </button>
                         )}
                         <div className="w-7 h-7 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                            {getIconForView(activeView)}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {mainTitle} <span className="text-primary-blue">{lastWord}</span>
                        </h1>
                    </div>
                     <div id="tour-step-header-controls" className="flex items-center space-x-2 sm:space-x-4">
                         <LanguageSwitcher currentLang={settings.language} toggleLang={toggleLanguage} />
                         
                         {onStartTour && (
                            <div id="tour-step-start-tour">
                                <button 
                                    onClick={onStartTour}
                                    className="h-10 w-10 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                    aria-label={t.startTour}
                                    title={t.startTour}
                                >
                                    <QuestionMarkCircleIcon />
                                </button>
                            </div>
                         )}

                         <button 
                            onClick={toggleTheme}
                            className="h-10 w-10 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label={t.toggleTheme}
                         >
                            {settings.theme === 'light' ? <SunIcon /> : <MoonIcon />}
                         </button>
                     </div>
                </div>
            </div>
        </header>
    );
};