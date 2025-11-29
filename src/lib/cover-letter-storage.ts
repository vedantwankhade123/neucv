import { CoverLetterData } from '@/types/coverletter';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'coverLetters';

export const getCoverLetters = (): CoverLetterData[] => {
    try {
        const dataJson = localStorage.getItem(STORAGE_KEY);
        return dataJson ? JSON.parse(dataJson) : [];
    } catch (error) {
        console.error("Failed to parse cover letters from localStorage", error);
        return [];
    }
};

const saveCoverLetters = (data: CoverLetterData[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getCoverLetter = (id: string): CoverLetterData | undefined => {
    return getCoverLetters().find(item => item.id === id);
};

export const saveCoverLetter = (itemToSave: CoverLetterData): void => {
    const items = getCoverLetters();
    const index = items.findIndex(item => item.id === itemToSave.id);
    const updatedItem = { ...itemToSave, lastModified: Date.now() };

    if (index !== -1) {
        items[index] = updatedItem;
    } else {
        items.push(updatedItem);
    }
    saveCoverLetters(items);
};

export const deleteCoverLetter = (id: string): void => {
    let items = getCoverLetters();
    items = items.filter(item => item.id !== id);
    saveCoverLetters(items);
};

export const duplicateCoverLetter = (id: string): CoverLetterData | undefined => {
    const itemToDuplicate = getCoverLetter(id);
    if (!itemToDuplicate) return undefined;

    const newItem: CoverLetterData = {
        ...itemToDuplicate,
        id: uuidv4(),
        title: `${itemToDuplicate.title} (Copy)`,
        lastModified: Date.now(),
    };

    const items = getCoverLetters();
    items.unshift(newItem);
    saveCoverLetters(items);
    return newItem;
};
