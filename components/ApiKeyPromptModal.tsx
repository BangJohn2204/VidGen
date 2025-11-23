
import React from 'react';
import type { AppSettings } from '../types';
// This component is deprecated as per the new guidelines.
// The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
// UI for managing the API key should not be present.
// The component is stubbed to return null to avoid breaking any potential (but incorrect) imports.

// FIX: Define a stub type to resolve the import error for this deprecated component.
// This allows the component to exist without modifying shared i18n files for deprecated code.
type ApiKeyPromptModalLocale = Record<string, string>;

interface ApiKeyPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settingsUpdate: Partial<AppSettings>, newApiKey: string | null) => void;
    initialApiKey: string | null;
    initialApiMode: 'default' | 'user';
    t: ApiKeyPromptModalLocale;
}

export const ApiKeyPromptModal: React.FC<ApiKeyPromptModalProps> = ({ isOpen }) => {
    // Render nothing, as this feature is deprecated.
    if (!isOpen) {
        return null;
    }
    return null;
};
