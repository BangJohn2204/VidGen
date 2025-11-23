


import React from 'react';
import { CameraIcon, CubeIcon, UtensilsIcon, UserIcon, SettingsIcon, LayoutGridIcon, VideoIcon, SmartphoneIcon, UgcSoundIcon, UsersIcon, FilmIcon } from './IconComponents';
import type { SidebarLocale } from '../i18n/locales';

type ActiveView = 'marketing' | 'food' | 'portrait' | 'poster' | 'videography' | 'ugcVideography' | 'ugcSoundVideography' | 'ugcAffiliate' | 'interactiveAnimation';

interface SidebarProps {
    activeView: ActiveView;
    onViewChange: (view: ActiveView) => void;
    onSettingsClick: () => void;
    t: SidebarLocale;
}

const NavItem: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 text-base font-semibold rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                isActive
                    ? 'bg-primary-blue text-white'
                    : 'text-neutral-500 hover:bg-neutral-700/50 hover:text-white'
            }`}
        >
            <div className="w-6 h-6 flex-shrink-0">{icon}</div>
            <span>{label}</span>
        </button>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onSettingsClick, t }) => {
    return (
        <nav className="w-80 bg-neutral-900 text-white flex-shrink-0 p-4 flex flex-col hidden lg:flex">
            <div className="flex items-center gap-3 py-4 border-b border-neutral-700/50">
                <div className="w-9 h-9 text-primary-blue-light">
                    <CameraIcon />
                </div>
                <h1 className="text-2xl font-bold text-neutral-200 whitespace-nowrap">
                    AI Tools Studio
                </h1>
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <div className="mt-6 space-y-2.5">
                    <NavItem
                        label={t.productPhotography}
                        isActive={activeView === 'marketing'}
                        onClick={() => onViewChange('marketing')}
                        icon={<CubeIcon />}
                    />
                    <NavItem
                        label={t.foodPhotography}
                        isActive={activeView === 'food'}
                        onClick={() => onViewChange('food')}
                        icon={<UtensilsIcon />}
                    />
                    <NavItem
                        label={t.portraitPhotography}
                        isActive={activeView === 'portrait'}
                        onClick={() => onViewChange('portrait')}
                        icon={<UserIcon />}
                    />
                    <NavItem
                        label={t.posterDesign}
                        isActive={activeView === 'poster'}
                        onClick={() => onViewChange('poster')}
                        icon={<LayoutGridIcon />}
                    />
                    <NavItem
                        label={t.videoCreation}
                        isActive={activeView === 'videography'}
                        onClick={() => onViewChange('videography')}
                        icon={<VideoIcon />}
                    />
                    <NavItem
                        label={t.ugcVideoCreation}
                        isActive={activeView === 'ugcVideography'}
                        onClick={() => onViewChange('ugcVideography')}
                        icon={<SmartphoneIcon />}
                    />
                    <NavItem
                        label={t.ugcSoundVideoCreation}
                        isActive={activeView === 'ugcSoundVideography'}
                        onClick={() => onViewChange('ugcSoundVideography')}
                        icon={<UgcSoundIcon />}
                    />
                     <NavItem
                        label={t.ugcAffiliateCreation}
                        isActive={activeView === 'ugcAffiliate'}
                        onClick={() => onViewChange('ugcAffiliate')}
                        icon={<UsersIcon />}
                    />
                     <NavItem
                        label={t.interactiveAnimation}
                        isActive={activeView === 'interactiveAnimation'}
                        onClick={() => onViewChange('interactiveAnimation')}
                        icon={<FilmIcon />}
                    />
                </div>
                <div className="space-y-2.5">
                    <NavItem
                        label={t.settings}
                        isActive={false}
                        onClick={onSettingsClick}
                        icon={<SettingsIcon />}
                    />
                </div>
            </div>
        </nav>
    );
};