
/**
 * A simple wrapper around localStorage with JSON parsing, error handling, and debounced writes.
 */

const debounceTimers: { [key: string]: number } = {};
const DEBOUNCE_DELAY = 400; // ms

export const storage = {
  /**
   * Retrieves an item from localStorage and parses it as JSON.
   * @param key The key of the item to retrieve.
   * @param defaultValue The default value to return if the key doesn't exist or an error occurs.
   * @returns The parsed value or the default value.
   */
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Serializes a value to JSON and stores it in localStorage after a debounce delay.
   * @param key The key to store the value under.
   * @param value The value to store.
   */
  set: <T>(key: string, value: T): void => {
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key]);
    }

    debounceTimers[key] = window.setTimeout(() => {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error(`Error writing to localStorage for key "${key}":`, error);
        }
        delete debounceTimers[key];
    }, DEBOUNCE_DELAY);
  },

  /**
   * Removes an item from localStorage.
   * @param key The key of the item to remove.
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  },
};
