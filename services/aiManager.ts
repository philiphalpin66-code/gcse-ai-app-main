// services/aiManager.ts

// In-memory cache for the current session.
const aiCache = new Map<string, any>();

/**
 * A generic function to fetch data from an AI service, with in-memory and localStorage caching.
 * It ensures that for a given key, the fetch function is only executed once per session,
 * and results are persisted to localStorage for subsequent sessions.
 *
 * @param key A unique key to identify the request.
 * @param fetchFn A function that returns a promise which resolves with the AI-generated data.
 * @returns A promise that resolves with the cached or newly fetched data.
 */
export async function fetchAIOnce<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  console.log('AI Manager request', key);
  // 1. Check in-memory session cache first for fastest access.
  if (aiCache.has(key)) {
    console.log(`[AI Manager] Cache HIT (memory): ${key}`);
    console.log('AI Manager returning', key);
    return aiCache.get(key);
  }

  // 2. Check localStorage for persistent cache across sessions.
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as T;
      console.log(`[AI Manager] Cache HIT (storage): ${key}`);
      aiCache.set(key, parsed); // Hydrate in-memory cache
      console.log('AI Manager returning', key);
      return parsed;
    }
  } catch (error) {
    console.warn(`[AI Manager] Failed to parse stored JSON for key "${key}". Clearing it.`, error);
    localStorage.removeItem(key); // Remove corrupted data
  }

  // 3. If no cache hit, execute the actual fetch function.
  console.log("Calling Gemini API for", key);
  const result = await fetchFn();

  // 4. Store the result in both in-memory and localStorage caches.
  aiCache.set(key, result);
  try {
    localStorage.setItem(key, JSON.stringify(result));
  } catch (error) {
    console.error(`[AI Manager] Failed to save result to localStorage for key "${key}".`, error);
  }

  console.log('AI Manager returning', key);
  return result;
}