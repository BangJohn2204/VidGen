


import React from 'react';
import { CameraIcon, CubeIcon, UtensilsIcon, UserIcon, LayoutGridIcon, SunIcon, MoonIcon, SettingsIcon, VideoIcon, SmartphoneIcon, UgcSoundIcon, UsersIcon, FilmIcon } from './IconComponents';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { MainMenuLocale, HeaderLocale } from '../i18n/locales';
import type { AppSettings } from '../types';

interface MainMenuProps {
    onToolSelect: (view: 'marketing' | 'food' | 'portrait' | 'poster' | 'videography' | 'ugcVideography' | 'ugcSoundVideography' | 'ugcAffiliate' | 'interactiveAnimation') => void;
    onSettingsClick: () => void;
    t: MainMenuLocale;
    t_header: HeaderLocale;
    settings: AppSettings;
    onSettingsChange: (changes: Partial<AppSettings>) => void;
}

interface ToolCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    color: 'indigo' | 'amber' | 'rose' | 'teal' | 'purple' | 'cyan' | 'sky' | 'lime' | 'fuchsia';
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500',
        amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500',
        rose: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500',
        teal: 'bg-teal-500/10 text-teal-500 group-hover:bg-teal-500',
        purple: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500',
        cyan: 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500',
        sky: 'bg-sky-500/10 text-sky-500 group-hover:bg-sky-500',
        lime: 'bg-lime-500/10 text-lime-500 group-hover:bg-lime-500',
        fuchsia: 'bg-fuchsia-500/10 text-fuchsia-500 group-hover:bg-fuchsia-500',
    };

    return (
        <button onClick={onClick} className="group text-center bg-white dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl hover:border-transparent dark:hover:border-transparent hover:-translate-y-2 transition-all duration-300">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:text-white ${colorClasses[color]}`}>
                {icon}
            </div>
            <h3 className="mt-5 text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        </button>
    );
};

export const MainMenu: React.FC<MainMenuProps> = ({ onToolSelect, t, onSettingsClick, settings, onSettingsChange, t_header }) => {
    
    const toggleTheme = () => {
        onSettingsChange({ theme: settings.theme === 'light' ? 'dark' : 'light' });
    };

    const toggleLanguage = () => {
        onSettingsChange({ language: settings.language === 'id' ? 'en' : 'id' });
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="absolute top-0 left-0 right-0 z-10 p-4">
                 <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="w-9 h-9 text-primary-blue-light">
                             <CameraIcon />
                         </div>
                         <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                             AI Tools Studio
                         </h1>
                    </div>
                     <div className="flex items-center space-x-2 sm:space-x-4">
                         <LanguageSwitcher currentLang={settings.language} toggleLang={toggleLanguage} />
                          <button 
                            onClick={toggleTheme}
                            className="h-10 w-10 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label={t_header.toggleTheme}
                         >
                            {settings.theme === 'light' ? <SunIcon /> : <MoonIcon />}
                         </button>
                         <button 
                            onClick={onSettingsClick}
                            className="h-10 w-10 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label={t_header.settings}
                         >
                            <div className="w-6 h-6"><SettingsIcon /></div>
                         </button>
                     </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400">{t.subtitle}</p>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ToolCard 
                            icon={<div className="w-8 h-8"><CubeIcon/></div>}
                            title={t.productTitle}
                            description={t.productDesc}
                            onClick={() => onToolSelect('marketing')}
                            color="indigo"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><UtensilsIcon/></div>}
                            title={t.foodTitle}
                            description={t.foodDesc}
                            onClick={() => onToolSelect('food')}
                            color="amber"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><UserIcon/></div>}
                            title={t.portraitTitle}
                            description={t.portraitDesc}
                            onClick={() => onToolSelect('portrait')}
                            color="rose"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><LayoutGridIcon/></div>}
                            title={t.posterTitle}
                            description={t.posterDesc}
                            onClick={() => onToolSelect('poster')}
                            color="teal"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><VideoIcon/></div>}
                            title={t.videoTitle}
                            description={t.videoDesc}
                            onClick={() => onToolSelect('videography')}
                            color="purple"
                        />
                        <ToolCard 
                            icon={<div className="w-8 h-8"><SmartphoneIcon/></div>}
                            title={t.ugcVideoTitle}
                            description={t.ugcVideoDesc}
                            onClick={() => onToolSelect('ugcVideography')}
                            color="cyan"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><UgcSoundIcon/></div>}
                            title={t.ugcSoundVideoTitle}
                            description={t.ugcSoundVideoDesc}
                            onClick={() => onToolSelect('ugcSoundVideography')}
                            color="sky"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><UsersIcon/></div>}
                            title={t.ugcAffiliateTitle}
                            description={t.ugcAffiliateDesc}
                            onClick={() => onToolSelect('ugcAffiliate')}
                            color="lime"
                        />
                         <ToolCard 
                            icon={<div className="w-8 h-8"><FilmIcon/></div>}
                            title={t.interactiveAnimationTitle}
                            description={t.interactiveAnimationDesc}
                            onClick={() => onToolSelect('interactiveAnimation')}
                            color="fuchsia"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}