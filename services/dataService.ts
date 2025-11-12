


import { SavedQuestion, PerformanceMetrics, TelemetryEvent, User } from '../types';
// FIX: The cloudService module exports individual functions, not a single object. Use import * to namespace them.
import * as cloudService from './cloudService';

const SAVED_QUESTIONS_KEY = 'gcseAiCoachSavedQuestions';
const PERFORMANCE_HISTORY_KEY = 'gcseAiCoachPerfHistory';
const TELEMETRY_EVENTS_KEY = 'gcseAiCoachTelemetry';

// --- Saved Questions ---
export const getInitialSavedQuestions = (): SavedQuestion[] => {
  try {
    const saved = localStorage.getItem(SAVED_QUESTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to retrieve saved questions from localStorage:", error);
    return [];
  }
};

export const storeSavedQuestions = (questions: SavedQuestion[]): void => {
  try {
    localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(questions));
  } catch (error) {
    console.error("Failed to store saved questions in localStorage:", error);
  }
};

// --- Performance Telemetry ---
export const getPerformanceHistory = (): PerformanceMetrics[] => { /* Unchanged */ 
  try {
    const saved = localStorage.getItem(PERFORMANCE_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to retrieve performance history:", error);
    return [];
  }
};
export const storePerformanceHistory = (history: PerformanceMetrics[]): void => { /* Unchanged */ 
  try {
    const recentHistory = history.slice(-20);
    localStorage.setItem(PERFORMANCE_HISTORY_KEY, JSON.stringify(recentHistory));
  } catch (error) {
    console.error("Failed to store performance history:", error);
  }
};

// --- Learning Analytics (Telemetry Events) ---
// This is now handled by the offline queue, so direct storage is deprecated.
export const getTelemetryEvents = (): TelemetryEvent[] => [];
export const storeTelemetryEvents = (events: TelemetryEvent[]): void => {
  console.warn("storeTelemetryEvents is deprecated. Use offlineQueueService.");
};