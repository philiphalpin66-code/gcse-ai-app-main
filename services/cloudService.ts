// services/cloudService.ts
import { db, isFirebaseEnabled } from '../firebase/config';
import { 
    doc, getDoc, setDoc, writeBatch, serverTimestamp, 
    collection, query, where, getDocs 
} from 'firebase/firestore';
import { User, AppProgress, TelemetryEvent, OnboardingData } from '../types';
import { storage } from '../utils/storage';

// --- MOCK IMPLEMENTATION (for offline/dev mode) ---

const getProgressKey = (uid: string) => `mock_progress_${uid}`;
const getProfileKey = (uid: string) => `mock_profile_${uid}`;

const mock_createUserProfile = async (
    user: User,
    onboardingData: Partial<OnboardingData>,
    initialProgress: AppProgress
) => {
    const profileData = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString(),
        ...onboardingData,
    };
    storage.set(getProfileKey(user.uid), profileData);
    storage.set(getProgressKey(user.uid), initialProgress);
    console.log(`[Mock] Created profile and progress for new user ${user.uid}.`);
};

const mock_getUserProgress = async (uid: string): Promise<AppProgress | null> => {
    const progress = storage.get<AppProgress | null>(getProgressKey(uid), null);
    console.log(`[Mock] Fetched progress for user ${uid}. Found: ${!!progress}`);
    return progress;
};

const mock_saveUserProgress = async (uid: string, progress: AppProgress): Promise<void> => {
    storage.set(getProgressKey(uid), progress);
    // No console log to avoid spam from debounced saves.
};

const mock_saveTelemetryEvents = async (events: TelemetryEvent[]): Promise<void> => {
    if (!events.length) return;
    console.log(`[Mock] "Saved" ${events.length} telemetry events.`);
};

const mock_getAnalyticsAggregate = async (classId: string): Promise<{ topicMastery: { topic: string; avgScore: number }[]; avgLift: number }> => {
    console.warn("[Mock] Analytics aggregation is not implemented in mock mode.");
    return { topicMastery: [], avgLift: 12.3 }; // Return some plausible mock data
};


// --- EXPORTED FUNCTIONS ---

export const createUserProfile = async (
    user: User,
    onboardingData: Partial<OnboardingData>,
    initialProgress: AppProgress
) => {
    if (!isFirebaseEnabled || !db) {
        return mock_createUserProfile(user, onboardingData, initialProgress);
    }

    const userDocRef = doc(db, 'users', user.uid);
    const progressDocRef = doc(db, 'users', user.uid, 'progress', 'main');
    const batch = writeBatch(db);

    const profileData = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        createdAt: serverTimestamp(),
        ...onboardingData,
    };

    batch.set(userDocRef, profileData);
    batch.set(progressDocRef, initialProgress);
    
    try {
        await batch.commit();
        console.log(`☁️ Cloud Service: Created profile and progress for new user ${user.uid}.`);
    } catch (error) {
        console.warn("⚠️ Firebase: Failed to create user profile.", error);
        throw error;
    }
};

export const getUserProgress = async (uid: string): Promise<AppProgress | null> => {
    if (!isFirebaseEnabled || !db) {
        return mock_getUserProgress(uid);
    }

    const progressDocRef = doc(db, 'users', uid, 'progress', 'main');
    try {
        const docSnap = await getDoc(progressDocRef);
        if (docSnap.exists()) {
            console.log(`☁️ Cloud Service: Fetched progress for user ${uid}.`);
            return docSnap.data() as AppProgress;
        } else {
            console.log(`☁️ Cloud Service: No progress document found for user ${uid}.`);
            return null;
        }
    } catch (error) {
        console.warn("⚠️ Firebase: Failed to get user progress.", error);
        throw error;
    }
};

export const saveUserProgress = async (uid: string, progress: AppProgress): Promise<void> => {
    if (!isFirebaseEnabled || !db) {
        return mock_saveUserProgress(uid, progress);
    }

    const progressDocRef = doc(db, 'users', uid, 'progress', 'main');
    try {
        await setDoc(progressDocRef, progress, { merge: true });
    } catch (error) {
        console.warn("⚠️ Firebase sync failed:", error);
    }
};

export const saveTelemetryEvents = async (events: TelemetryEvent[]): Promise<void> => {
    if (!isFirebaseEnabled || !db) {
        return mock_saveTelemetryEvents(events);
    }
    if (!events.length) return;
    const batch = writeBatch(db);
    const telemetryColRef = collection(db, 'telemetry');
    
    events.forEach(event => {
        const eventDocRef = doc(telemetryColRef, event.client_event_id);
        batch.set(eventDocRef, event);
    });

    try {
        await batch.commit();
        console.log(`☁️ Synced ${events.length} telemetry events.`);
    } catch (error) {
        console.warn("⚠️ Firebase: Failed to save telemetry events.", error);
        throw error;
    }
};

export const getAnalyticsAggregate = async (classId: string): Promise<{ topicMastery: { topic: string; avgScore: number }[]; avgLift: number }> => {
    if (!isFirebaseEnabled || !db) {
        return mock_getAnalyticsAggregate(classId);
    }
    
    console.warn("Performing inefficient client-side aggregation for analytics. This should be moved to a backend function in production.");
    const relevantEventsQuery = query(collection(db, "telemetry"), where("class_id", "==", classId));
    
    let totalLift = 0;
    let eventCount = 0;
    try {
        const querySnapshot = await getDocs(relevantEventsQuery);
        querySnapshot.forEach((doc) => {
            const event = doc.data() as TelemetryEvent;
            totalLift += event.lift;
            eventCount++;
        });
    } catch(error) {
        console.warn("⚠️ Firebase: Could not fetch telemetry for analytics.", error);
    }

    const avgLift = eventCount > 0 ? (totalLift / eventCount) * 100 : 0;
    
    return {
        topicMastery: [],
        avgLift
    };
};