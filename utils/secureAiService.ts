// FIX: Replaced deprecated GenerateContentRequest with GenerateContentParameters.
import { GoogleGenAI, Chat, GenerateContentParameters, Content, Part, GenerateContentResponse } from '@google/genai';
import { User } from '../types';

// Helper function to create an AI client instance.
// Throws a clear error if the API key is missing.
const getAiClient = () => {
    if (!process.env.API_KEY) {
        const errorMessage = "CRITICAL: API_KEY environment variable not found. Cannot connect to AI service.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};


const addUserContextToPrompt = (prompt: string, user: User): string => {
    return `${prompt}\n\n(System Note: Generate response for a user in the '${user.locale}' region.)`;
}

// NEW: Wrapper function to handle API calls with exponential backoff for rate limiting.
const withRetries = async <T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let attempt = 0;
    while (true) { // Loop will be broken by return or throw
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            // Check if the error is a rate limit error (429). The Gemini SDK might not expose status codes directly, so check the message.
            const isRateLimitError = error && (error.status === 'RESOURCE_EXHAUSTED' || (error.message && error.message.includes('429')));

            if (isRateLimitError && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
                console.warn(`[Secure AI] Rate limit hit. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Non-retriable error or max retries reached.
                console.error(`[Secure AI] Non-retriable error or max retries reached after ${attempt} attempts.`, error);
                throw error;
            }
        }
    }
};


/**
 * Simulates a fetch call to a secure backend endpoint like `/api/ai/generate`.
 * @param user The authenticated user object for context and authorization.
 * @param request The original request payload for the Gemini API.
 * @returns A promise that resolves with the AI's response.
 */
export const secureGenerateContent = async (
    user: User,
    // FIX: Use specific GenerateContentParameters type instead of any.
    request: GenerateContentParameters
): Promise<GenerateContentResponse> => {
    const ai = getAiClient();
    
    // FIX: Use type guards to safely access 'parts' property on 'contents'.
    // Simulate adding user context (like locale) on the server-side.
    if (typeof request.contents === 'string') {
        request.contents = addUserContextToPrompt(request.contents, user);
    } else if (Array.isArray(request.contents)) {
        // This is Content[] or (string|Part)[]. Modify the text of the first part of the last content object if it's a Content.
        const lastContent = request.contents[request.contents.length - 1];
        if (lastContent && typeof lastContent === 'object' && 'parts' in lastContent && Array.isArray(lastContent.parts)) {
            const firstPart = lastContent.parts[0];
            if (firstPart && 'text' in firstPart) {
                firstPart.text = addUserContextToPrompt(firstPart.text, user);
            }
        }
    } else if (request.contents && typeof request.contents === 'object' && 'parts' in request.contents) {
        // This is a Content object.
        const content = request.contents as Content;
        if (Array.isArray(content.parts)) {
            const firstPart = content.parts[0];
            if (firstPart && 'text' in firstPart) {
                firstPart.text = addUserContextToPrompt(firstPart.text, user);
            }
        }
    }
    
    console.log(`🔒 Secure AI Proxy: User ${user.uid} is requesting content from model ${request.model}.`);
    
    // MODIFIED: Wrap the API call with retry logic.
    const apiCall = () => ai.models.generateContent(request);

    try {
        await new Promise(res => setTimeout(res, 250)); // Simulate network latency
        return await withRetries(apiCall);
    } catch (error) {
        console.error(`🔒 Secure AI Proxy Error after all retries:`, error);
        throw error;
    }
};

/**
 * Simulates a streaming fetch call to a secure backend endpoint.
 * @param user The authenticated user object.
 * @param request The original request payload for the Gemini API.
 * @returns An async generator that yields the AI's response chunks.
 */
export const secureGenerateContentStream = async function* (
    user: User,
    // FIX: Use specific GenerateContentParameters type instead of any.
    request: GenerateContentParameters,
    maxRetries = 3
) {
    const ai = getAiClient();

    // FIX: Use type guards to safely access 'parts' property on 'contents'.
    if (typeof request.contents === 'string') {
        request.contents = addUserContextToPrompt(request.contents, user);
    } else if (Array.isArray(request.contents)) {
        // This is Content[] or (string|Part)[]. Modify the text of the first part of the last content object if it's a Content.
        const lastContent = request.contents[request.contents.length - 1];
        if (lastContent && typeof lastContent === 'object' && 'parts' in lastContent && Array.isArray(lastContent.parts)) {
            const firstPart = lastContent.parts[0];
            if (firstPart && 'text' in firstPart) {
                firstPart.text = addUserContextToPrompt(firstPart.text, user);
            }
        }
    } else if (request.contents && typeof request.contents === 'object' && 'parts' in request.contents) {
        // This is a Content object.
        const content = request.contents as Content;
        if (Array.isArray(content.parts)) {
            const firstPart = content.parts[0];
            if (firstPart && 'text' in firstPart) {
                firstPart.text = addUserContextToPrompt(firstPart.text, user);
            }
        }
    }

    console.log(`🔒 Secure AI Proxy (Stream): User ${user.uid} is requesting a stream from model ${request.model}.`);
    
    // MODIFIED: Implement retry logic directly within the generator.
    let attempt = 0;
    while (true) {
        try {
            const response = await ai.models.generateContentStream(request);
            for await (const chunk of response) {
                yield chunk;
            }
            return; // Successful stream, exit the loop.
        } catch (error: any) {
            attempt++;
            const isRateLimitError = error && (error.status === 'RESOURCE_EXHAUSTED' || (error.message && error.message.includes('429')));

            if (isRateLimitError && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`[Secure AI Stream] Rate limit hit. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`🔒 Secure AI Proxy Error (Stream) after all retries:`, error);
                throw error;
            }
        }
    }
};

/**
 * Simulates creating a secure chat session on the backend.
 * @param user The authenticated user object.
 * @param request The configuration for the chat session.
 * @returns A Chat instance.
 */
export const secureCreateChat = (
    user: User,
    request: { model: string; config: { systemInstruction: string } }
): Chat => {
    const ai = getAiClient();

    console.log(`🔒 Secure AI Proxy (Chat): User ${user.uid} is creating a chat with model ${request.model}.`);
    
    // Add user context to system instruction
    request.config.systemInstruction = addUserContextToPrompt(request.config.systemInstruction, user);

    return ai.chats.create(request);
};