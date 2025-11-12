import { ProgressEvent } from '../types';

/**
 * Computes the average mastery delta for a subject over the last 7 days.
 * @param subject The subject name to calculate momentum for.
 * @param events The array of all progress events.
 * @returns The momentum score.
 */
export const computeSubjectMomentum = (subject: string, events: ProgressEvent[]): number => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const relevantEvents = events.filter(event => {
        const eventDate = new Date(event.ts);
        return event.subject === subject && eventDate >= sevenDaysAgo;
    });

    if (relevantEvents.length === 0) {
        return 0;
    }

    const totalDelta = relevantEvents.reduce((sum, event) => sum + event.delta, 0);
    return totalDelta / relevantEvents.length;
};

/**
 * Gets the most recent activity items for a specific subject.
 * @param subject The subject name to filter by.
 * @param count The number of items to return.
 * @param events The array of all progress events.
 * @returns An array of ProgressEvent objects.
 */
export const getSubjectHistory = (subject: string, count = 10, events: ProgressEvent[]): ProgressEvent[] => {
    return events
        .filter(event => event.subject === subject)
        .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
        .slice(0, count);
};