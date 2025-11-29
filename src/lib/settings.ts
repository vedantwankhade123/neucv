// Auto-save settings management

export interface AutoSaveSettings {
    resumeAutoSave: boolean;
}

const SETTINGS_KEY = 'autoSaveSettings';

const defaultSettings: AutoSaveSettings = {
    resumeAutoSave: true, // Enabled by default
};

export const getAutoSaveSettings = (): AutoSaveSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...defaultSettings, ...parsed };
        }
        return defaultSettings;
    } catch (error) {
        console.error('Failed to load auto-save settings:', error);
        return defaultSettings;
    }
};

export const saveAutoSaveSettings = (settings: AutoSaveSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save auto-save settings:', error);
    }
};

export const updateResumeAutoSave = (enabled: boolean): void => {
    const settings = getAutoSaveSettings();
    settings.resumeAutoSave = enabled;
    saveAutoSaveSettings(settings);
};
