

import { TelemetryEvent } from '../types';
// FIX: The cloudService module exports individual functions, not a single object. Use import * to namespace them.
import * as cloudService from './cloudService';

const OFFLINE_QUEUE_KEY = 'gcseAiCoachOfflineQueue';
let syncInterval: number | null = null;

const getQueue = (): TelemetryEvent[] => {
    try {
        const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveQueue = (queue: TelemetryEvent[]) => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const syncQueue = async () => {
    let queue = getQueue();
    if (queue.length === 0) {
        return;
    }

    console.log(`🛰️ Offline Queue: Attempting to sync ${queue.length} events...`);
    try {
        await cloudService.saveTelemetryEvents(queue);
        // On success, clear the queue
        saveQueue([]);
        console.log(`🛰️ Offline Queue: Sync successful. Queue cleared.`);
    } catch (error) {
        console.log('🛰️ Offline Queue: Sync failed (likely offline). Will retry later.');
    }
};

export const offlineQueueService = {
    enqueue: (event: TelemetryEvent) => {
        const queue = getQueue();
        queue.push(event);
        saveQueue(queue);
        console.log(`🛰️ Offline Queue: Event for topic '${event.topic}' enqueued.`);
    },
    start: () => {
        if (syncInterval) return;
        console.log('🛰️ Offline Queue: Sync process started (every 10 seconds).');
        // Immediately try to sync on start
        syncQueue();
        syncInterval = window.setInterval(syncQueue, 10000);
    },
    stop: () => {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
            console.log('🛰️ Offline Queue: Sync process stopped.');
        }
    }
};