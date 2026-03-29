export const getLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`[storageHelper] Error parsing key "${key}":`, error);
    return defaultValue;
  }
};

export const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storageHelper] Error saving key "${key}":`, error);
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('[storageHelper] Error clearing storage:', error);
  }
};
