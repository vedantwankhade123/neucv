// Auto-save settings management

export interface AutoSaveSettings {
    resumeAutoSave: boolean;
    interviewAutoSubmit: boolean; // Submit answer automatically on silence
    interviewAutoNext: boolean;   // Move to next question automatically after submit
    interviewTTS: boolean;        // Read questions aloud (Text-to-Speech)
}

const SETTINGS_KEY = 'appSettings'; // Renamed from autoSaveSettings for broader scope

const defaultSettings: AutoSaveSettings = {
    resumeAutoSave: true,
    interviewAutoSubmit: true,
    interviewAutoNext: true,
    interviewTTS: true,
};

export const getAutoSaveSettings = (): AutoSaveSettings => {
    try {
        // Try new key first
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
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