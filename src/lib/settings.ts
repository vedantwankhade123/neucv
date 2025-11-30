// Auto-save settings management

export interface AutoSaveSettings {
    resumeAutoSave: boolean;
    interviewTTS: boolean;        // Read questions aloud (Text-to-Speech)
    defaultLanguage: string;      // Default interview language
    silenceDuration: number;      // Silence duration in ms before stopping mic
}

const SETTINGS_KEY = 'appSettings'; 

const defaultSettings: AutoSaveSettings = {
    resumeAutoSave: true,
    interviewTTS: true,
    defaultLanguage: 'english',
    silenceDuration: 5000, // Default 5 seconds
};

export const getAutoSaveSettings = (): AutoSaveSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Ensure new defaults are merged if missing
            return { ...defaultSettings, ...parsed };
        }
        
        // Fallback to old key for migration
        const oldStored = localStorage.getItem('autoSaveSettings');
        if (oldStored) {
            const parsed = JSON.parse(oldStored);
            return { ...defaultSettings, ...parsed };
        }

        return defaultSettings;
    } catch (error) {
        console.error('Failed to load settings:', error);
        return defaultSettings;
    }
};

export const saveAutoSaveSettings = (settings: AutoSaveSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
};

export const updateResumeAutoSave = (enabled: boolean): void => {
    const settings = getAutoSaveSettings();
    settings.resumeAutoSave = enabled;
    saveAutoSaveSettings(settings);
};

export const updateInterviewSettings = (partialSettings: Partial<AutoSaveSettings>): void => {
    const settings = getAutoSaveSettings();
    const newSettings = { ...settings, ...partialSettings };
    saveAutoSaveSettings(newSettings);
};