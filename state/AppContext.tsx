import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from '../firebase/config';
import * as cloudService from '../services/cloudService';
import { 
    AppProgress, SubjectProgress, TopicProgress, Badge, UpdateProgressArgs, ProgressEvent, 
    User, ExamConfig, Question, StudentAnswer, SavedQuestion, FeedbackItem, RevisionPlanObject,
    PerformanceMetrics, TelemetryEvent, UserSelections, OnboardingData, StudentState, SessionResult, StudySession, TopicMastery, ExamSession
} from '../types';
import { storage } from '../utils/storage';
import { SUBJECT_DATA } from '../constants';
import { mapScoreToConfidenceDelta, mapScoreToDelta } from '../utils/scoring';
import { shouldAwardBadge } from './badges';
import { saveExamResults } from '../hooks/useSaveExamResults';
import { generateRevisionPlan, generateProfileInsight, generateOnboardingTourIntro } from '../utils/aiService';
import { getInitialSavedQuestions, storeSavedQuestions, getPerformanceHistory, storePerformanceHistory } from '../services/dataService';
import { offlineQueueService } from '../services/offlineQueueService';
import { v4 as uuidv4 } from 'uuid';
import { markPaper } from '../services/markingService';
import { updateUserProgress } from '../services/progressService';
// FIX: Import the missing FeedbackPageSkeleton component.
import FeedbackPageSkeleton from '../components/FeedbackPageSkeleton';

const SCHEMA_VERSION = 2;

const migrateProgressToV2 = (progress: AppProgress): AppProgress => {
    console.log("Migrating progress data to schema v2...");
    const migratedProgress = JSON.parse(JSON.stringify(progress));
    for (const subject of migratedProgress.subjects) {
        if (subject.topics && subject.topics.length > 0) {
            const avgMastery = subject.topics.reduce((acc: number, t: TopicProgress) => acc + t.current, 0) / subject.topics.length;
            subject.currentGrade = avgMastery * 8 + 1;
        } else {
            subject.currentGrade = 1;
        }
    }
    if (migratedProgress.subjects.length > 0) {
        migratedProgress.overallGradeEstimate = migratedProgress.subjects.reduce((acc: number, s: SubjectProgress) => acc + s.currentGrade, 0) / migratedProgress.subjects.length;
    } else {
        migratedProgress.overallGradeEstimate = 1;
    }
    migratedProgress.schemaVersion = SCHEMA_VERSION;
    migratedProgress.events = migratedProgress.events || [];
    migratedProgress.weakTopics = migratedProgress.weakTopics || [];
    return migratedProgress;
};

const createInitialProgress = (): AppProgress => {
    const subjects = SUBJECT_DATA.slice(0, 3).map((s, i): SubjectProgress => {
        const topics: TopicProgress[] = (['Topic A', 'Topic B', 'Topic C']).map((t_name, j): TopicProgress => ({
            id: `${s.id}-topic-${j}`, name: `${s.name} ${t_name}`,
            current: 0.3 + (j * 0.1) + (i * 0.05), confidence: 0.6,
            lastTested: new Date().toISOString()
        }));
        const avgMastery = topics.reduce((acc, t) => acc + t.current, 0) / topics.length;
        const currentGrade = avgMastery * 8 + 1;
        return { id: s.id, name: s.name, currentGrade: currentGrade, topics: topics };
    });
    const overallGradeEstimate = subjects.reduce((acc, s) => acc + s.currentGrade, 0) / subjects.length;
    return {
        overallGradeEstimate, targetGrade: 8, streak: 21, subjects,
        schemaVersion: SCHEMA_VERSION, events: [],
        latestGrade: "7", lastScorePercent: 78, previousScorePercent: 72, weakTopics: ["Cell Biology", "Organisation", "Bioenergetics"],
    };
};

const getInitialProgressStateFromLocal = (): AppProgress => {
    const savedProgress = storage.get<AppProgress | null>('appProgress', null);
    if (!savedProgress) return createInitialProgress();
    if (!savedProgress.schemaVersion || savedProgress.schemaVersion < SCHEMA_VERSION) {
        const migrated = migrateProgressToV2(savedProgress);
        storage.set('appProgress', migrated);
        return migrated;
    }
    return savedProgress;
};

interface AppContextType {
    user: User | null;
    page: string;
    pageContext: any;
    userSelections: UserSelections;
    examConfig: ExamConfig | null;
    preloadedQuestions: Question[] | null;
    feedbackSession: any | null;
    revisionPlan: RevisionPlanObject | null;
    tutorModalItem: FeedbackItem | null;
    isGeneratingPlan: boolean;
    savedQuestions: SavedQuestion[];
    performanceHistory: PerformanceMetrics[];
    lastPerfMetrics: PerformanceMetrics | null;
    showChangelog: boolean;
    studyDetailsModalSession: StudySession | null;
    onboardingStep: number;
    onboardingData: Partial<OnboardingData>;
    onboardingTourMessage: string | null;
    progress: AppProgress;
    studentState: StudentState;
    topicMastery: TopicMastery[];
    awardedBadge: Badge | null;
    telemetryEvents: TelemetryEvent[];
    handleAuth: () => void;
    handleSelectionComplete: (selections: UserSelections) => void;
    handleStartBlitz: (config: ExamConfig, preloadedQuestions?: Question[]) => void;
    handleFinishBlitz: (questions: Question[], answers: StudentAnswer[]) => void;
    handleToggleSaveQuestion: (item: FeedbackItem) => void;
    handleGeneratePlan: () => Promise<void>;
    handleRecordTelemetry: (event: Omit<TelemetryEvent, 'client_event_id' | 'timestamp' | 'class_id' | 'institution_id'>) => void;
    handleRecordPerformance: (metrics: PerformanceMetrics) => void;
    navigateTo: (pageName: string, context?: any) => void;
    handleOnboardingNext: (data?: Partial<OnboardingData>) => void;
    handleOnboardingBack: () => void;
    handleOnboardingComplete: () => void;
    setTarget: (grade: number) => void;
    updateTopicProgress: (args: UpdateProgressArgs) => void;
    updateProgress: (summary: any, newWeakTopics?: string[]) => void;
    dismissAwardedBadge: () => void;
    clearPreloadedQuestions: () => void;
    setShowChangelog: React.Dispatch<React.SetStateAction<boolean>>;
    setStudyDetailsModalSession: React.Dispatch<React.SetStateAction<StudySession | null>>;
    setTutorModalItem: React.Dispatch<React.SetStateAction<FeedbackItem | null>>;
    setLastPerfMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<string>('auth');
    const [userSelections, setUserSelections] = useState<UserSelections>(storage.get('userSelections', {}));
    const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
    const [preloadedQuestions, setPreloadedQuestions] = useState<Question[] | null>(null);
    const [feedbackSession, setFeedbackSession] = useState<any | null>(null);
    const [revisionPlan, setRevisionPlan] = useState<RevisionPlanObject | null>(null);
    const [tutorModalItem, setTutorModalItem] = useState<FeedbackItem | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [pageContext, setPageContext] = useState<any>(null);
    const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>(getInitialSavedQuestions);
    const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>(getPerformanceHistory);
    const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
    const [lastPerfMetrics, setLastPerfMetrics] = useState<PerformanceMetrics | null>(null);
    const [showChangelog, setShowChangelog] = useState(false);
    const [studyDetailsModalSession, setStudyDetailsModalSession] = useState<StudySession | null>(null);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
    const [onboardingTourMessage, setOnboardingTourMessage] = useState<string | null>(null);
    const tourIntroFetchedRef = useRef(false);
    const [progress, setProgress] = useState<AppProgress>(getInitialProgressStateFromLocal());
    const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
    const [awardedBadge, setAwardedBadge] = useState<Badge | null>(null);

    const navigateTo = useCallback((pageName: string, context: any = null) => {
        setPageContext(context);
        setPage(pageName);
    }, []);

    // Main Auth and Data Loading Effect
    useEffect(() => {
        // --- MOCK AUTH LOGIC ---
        if (!isFirebaseEnabled || !auth) {
            setIsLoading(true);
            const mockAppUser: User = {
                uid: 'demoUser123', email: 'student@example.com', role: 'student',
                class_ids: ['BIOLOGY-101'], institution_id: 'UK-ACADEMY-01', locale: 'en-GB'
            };
            setUser(mockAppUser);
            offlineQueueService.start();

            // Use mock service to get progress
            cloudService.getUserProgress(mockAppUser.uid).then(mockProgress => {
                if (mockProgress) {
                    setProgress(mockProgress);
                    navigateTo('landing');
                } else {
                    navigateTo('onboarding');
                    setOnboardingStep(1);
                }
                setIsLoading(false);
            });

            return () => offlineQueueService.stop();
        }

        // --- LIVE AUTH LOGIC ---
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setIsLoading(true);
            if (fbUser) {
                const appUser: User = {
                    uid: fbUser.uid, email: fbUser.email || 'anonymous@example.com', role: 'student',
                    class_ids: ['BIOLOGY-101'], institution_id: 'UK-ACADEMY-01', locale: 'en-GB'
                };
                setUser(appUser);
                offlineQueueService.start();

                try {
                    const firestoreProgress = await cloudService.getUserProgress(fbUser.uid);
                    if (firestoreProgress) {
                        setProgress(firestoreProgress);
                        navigateTo('landing');
                    } else {
                        navigateTo('onboarding');
                        setOnboardingStep(1);
                    }
                } catch (error) {
                    console.warn("⚠️ Firebase: Could not fetch initial progress, using local.", error);
                    setProgress(getInitialProgressStateFromLocal());
                    navigateTo('landing');
                }
            } else {
                setUser(null);
                offlineQueueService.stop();
                navigateTo('auth');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [navigateTo]);
    
    // Real-time Firestore Sync Listener
    useEffect(() => {
        if (!user?.uid || !isFirebaseEnabled || !db) return;

        const progressDocRef = doc(db, 'users', user.uid, 'progress', 'main');
        const unsubscribe = onSnapshot(progressDocRef, (doc) => {
            if (doc.exists()) {
                console.log("☁️ Real-time update received from Firestore.");
                const serverProgress = doc.data() as AppProgress;
                setProgress(serverProgress);
                storage.set('appProgress', serverProgress);
            }
        }, (error) => {
            console.warn("⚠️ Firebase: Real-time listener failed.", error);
        });

        return () => unsubscribe();
    }, [user?.uid]);


    // Debounced Firestore Write Effect
    useEffect(() => {
        if (!user?.uid || isLoading || !isFirebaseEnabled) return;

        const handler = setTimeout(() => {
            console.log(`☁️ Debounced write triggered for user ${user.uid}.`);
            cloudService.saveUserProgress(user.uid, progress);
        }, 2000);

        return () => clearTimeout(handler);
    }, [progress, user?.uid, isLoading]);
    
    useEffect(() => {
        if (!awardedBadge && badgeQueue.length > 0) {
            const [nextBadge, ...rest] = badgeQueue;
            setAwardedBadge(nextBadge);
            setBadgeQueue(rest);
        }
    }, [badgeQueue, awardedBadge]);

    const dismissAwardedBadge = () => setAwardedBadge(null);

    const setTarget = useCallback((grade: number) => {
        setProgress(prev => ({ ...prev, targetGrade: grade }));
    }, []);

    const updateTopicProgress = useCallback((args: UpdateProgressArgs) => {
        setProgress(prevProgress => {
            const progressBefore = prevProgress;
            const newProgress = JSON.parse(JSON.stringify(progressBefore));
            const subject = newProgress.subjects.find((s: SubjectProgress) => s.name === args.subject);
            if (!subject) return prevProgress;

            if (args.topic !== 'various') {
                let topic = subject.topics.find((t: TopicProgress) => t.name === args.topic || t.id === args.topic);
                if (!topic) {
                    topic = { id: args.topic, name: args.topic, current: 0.5, confidence: 0.5, lastTested: '' };
                    subject.topics.push(topic);
                }
                topic.current = Math.max(0, Math.min(1, topic.current + (args.delta / 100)));
                topic.confidence = Math.max(0, Math.min(1, topic.confidence + (args.confidenceDelta / 100)));
                topic.lastTested = new Date().toISOString();
            } else {
                if (subject.topics.length > 0) {
                    const distributedDelta = args.delta / subject.topics.length;
                    const distributedConfidenceDelta = args.confidenceDelta / subject.topics.length;
                    subject.topics.forEach((topic: TopicProgress) => {
                        topic.current = Math.max(0, Math.min(1, topic.current + (distributedDelta / 100)));
                        topic.confidence = Math.max(0, Math.min(1, topic.confidence + (distributedConfidenceDelta / 100)));
                    });
                }
            }

            const avgMastery = subject.topics.reduce((acc: number, t: TopicProgress) => acc + t.current, 0) / subject.topics.length;
            subject.currentGrade = avgMastery * 8 + 1;
            newProgress.overallGradeEstimate = newProgress.subjects.reduce((acc: number, s: SubjectProgress) => acc + s.currentGrade, 0) / newProgress.subjects.length;
            
            const newEvent: ProgressEvent = {
                id: crypto.randomUUID(), ts: new Date().toISOString(), subject: args.subject, topic: args.topic,
                kind: args.source === 'mock' ? 'mock_submitted' : args.source === 'flashcards' ? 'flashcard_session' : 'coach_session',
                delta: args.delta, confidenceDelta: args.confidenceDelta, meta: args.meta,
            };
            newProgress.events = [...(newProgress.events || []), newEvent].slice(-50);

            const newBadges = shouldAwardBadge(progressBefore, newProgress);
            if (newBadges.length > 0) {
                setBadgeQueue(q => [...q, ...newBadges]);
            }
            return newProgress;
        });
    }, []);

    const updateProgress = useCallback((summary: any, newWeakTopics?: string[]) => {
        setProgress(prev => {
            const previousScore = prev.lastScorePercent;
            const newStreak = summary.scorePercent >= (prev.lastScorePercent ?? -1) ? prev.streak + 1 : 1;
            const incomingWeakTopics = newWeakTopics ?? summary.weakTopics;
            const updatedWeakTopics = [...new Set([...(prev.weakTopics || []), ...incomingWeakTopics])];

            const newProgress: AppProgress = {
                ...prev,
                latestGrade: summary.predictedGrade,
                lastScorePercent: summary.scorePercent,
                previousScorePercent: previousScore,
                streak: newStreak,
                weakTopics: updatedWeakTopics,
            };

            console.info("[AppContext] Progress updated:", { newStreak, newWeakTopics: updatedWeakTopics.length, score: summary.scorePercent, prevScore: previousScore });
            return newProgress;
        });
    }, []);
    
    const studentState = useMemo((): StudentState => {
        const mastery: Record<string, number> = {};
        const confidence: Record<string, number> = {};
        progress.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                mastery[topic.name] = topic.current * 100;
                confidence[topic.name] = topic.confidence * 100;
            });
        });
        return {
            subjects: Object.keys(userSelections), mastery, confidence, streak: progress.streak,
            trialDaysLeft: 3, lastActivity: storage.get('lastActivity', null),
            weakTopics: progress.weakTopics || [],
        };
    }, [progress, userSelections]);
    
    const topicMastery = useMemo((): TopicMastery[] => {
        return progress.subjects.flatMap(subject => 
            subject.topics.map(topic => ({
                topic: topic.name, masteryScore: topic.current, trend: 0,
                lastUpdate: topic.lastTested, history: []
            }))
        );
    }, [progress.subjects]);

    const clearPreloadedQuestions = useCallback(() => setPreloadedQuestions(null), []);

    const handleAuth = async () => {
        if (!isFirebaseEnabled || !auth) {
            console.warn("[Mock] handleAuth called, but app is in mock mode. User should be auto-logged in by the app's main startup logic.");
            return;
        }
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("🔥 Firebase Anonymous Auth Failed:", error);
            alert("Could not sign in. Please check your connection and Firebase setup.");
        }
    };

    const handleSelectionComplete = (selections: UserSelections) => {
        setUserSelections(selections);
        storage.set('userSelections', selections);
        setOnboardingData(prev => ({...prev, selections}));
    };
    
    const handleStartBlitz = (config: ExamConfig, newPreloadedQuestions?: Question[]) => {
        if (newPreloadedQuestions) setPreloadedQuestions(newPreloadedQuestions);
        setExamConfig(config);
        navigateTo('blitzSession');
    };

    const handleFinishBlitz = async (questions: Question[], answers: StudentAnswer[]) => {
        if (!user || !examConfig) return;
        navigateTo('feedback');
        setFeedbackSession(null);
        try {
            const markingResult = await markPaper(questions, answers);
            const isRetest = examConfig.paper_name === "Targeted Retest";
            let finalWeakTopics: string[] | undefined;
            if (isRetest) { /* ... retest logic ... */ }
            const summary = await updateUserProgress({ results: markingResult, userId: user.uid, paperMeta: examConfig });
            updateProgress(summary, finalWeakTopics);
            const finalSession = { config: examConfig, questions, answers, ...markingResult };
            setFeedbackSession(finalSession);
            await saveExamResults(user.uid, markingResult);
        } catch (error) {
            console.error("Error during paper marking and progress update:", error);
            navigateTo('landing');
        }
    };
    
    const handleToggleSaveQuestion = (item: FeedbackItem) => {
        setSavedQuestions(prev => {
            const isSaved = prev.some(q => q.questionId === item.questionId);
            const newSaved = isSaved ? prev.filter(q => q.questionId !== item.questionId) : [...prev, item];
            storeSavedQuestions(newSaved);
            return newSaved;
        });
    };
    
    const handleGeneratePlan = async () => {
        if (!feedbackSession?.diagnosticReport || !user) return;
        setIsGeneratingPlan(true);
        try {
            const plan = await generateRevisionPlan(user, feedbackSession.diagnosticReport);
            setRevisionPlan(plan);
            navigateTo('revisionPlan');
        } catch (error) {
            console.error("Failed to generate revision plan:", error);
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleRecordTelemetry = (event: Omit<TelemetryEvent, 'client_event_id' | 'timestamp' | 'class_id' | 'institution_id'>) => {
        if (!user) return;
        const fullEvent: TelemetryEvent = {
            ...event, client_event_id: uuidv4(), timestamp: new Date().toISOString(),
            class_id: user.class_ids[0], institution_id: user.institution_id,
        };
        setTelemetryEvents(prev => [...prev, fullEvent]);
        offlineQueueService.enqueue(fullEvent);
    };

    const handleRecordPerformance = useCallback((metrics: PerformanceMetrics) => {
        setLastPerfMetrics(metrics);
        setPerformanceHistory(prev => {
            const newHistory = [...prev, metrics].slice(-20);
            storePerformanceHistory(newHistory);
            return newHistory;
        });
    }, []);
    
    const handleOnboardingNext = (data?: Partial<OnboardingData>) => {
        if (data) setOnboardingData(prev => ({ ...prev, ...data }));
        if (onboardingStep === 3 && data?.selections) {
            setUserSelections(data.selections);
            storage.set('userSelections', data.selections);
        }
        if (onboardingStep === 7) localStorage.setItem('trialStartDate', Date.now().toString());
        setOnboardingStep(s => s + 1);
    };

    const handleOnboardingBack = () => setOnboardingStep(s => s - 1);

    const handleOnboardingComplete = async () => {
        if (!user) {
            console.error("Cannot complete onboarding: user not authenticated.");
            return;
        }
        setIsLoading(true);
        const initialProgress = createInitialProgress();
        try {
            await cloudService.createUserProfile(user, onboardingData, initialProgress);
            setProgress(initialProgress);
            storage.set('appProgress', initialProgress);
            storage.set('hasOnboarded', true);
            navigateTo('landing');
        } catch(error) {
            console.error("🔥 Failed to create user profile during onboarding.", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (onboardingStep === 6 && !tourIntroFetchedRef.current && user) {
            tourIntroFetchedRef.current = true;
            generateOnboardingTourIntro(user)
                .then(message => setOnboardingTourMessage(message || "Here are the main tools to power your revision."))
                .catch(err => {
                    console.error("Failed to generate tour intro:", err);
                    setOnboardingTourMessage("Here are the main tools to power your revision.");
                });
        }
    }, [onboardingStep, user]);
    
    if (isLoading) {
        return <FeedbackPageSkeleton />;
    }

    const value: AppContextType = {
        user, page, pageContext, userSelections, examConfig, preloadedQuestions, feedbackSession, revisionPlan,
        tutorModalItem, isGeneratingPlan, savedQuestions, performanceHistory, lastPerfMetrics,
        showChangelog, studyDetailsModalSession, onboardingStep, onboardingData,
        onboardingTourMessage, progress, studentState, topicMastery, awardedBadge,
        telemetryEvents, handleAuth, handleSelectionComplete, handleStartBlitz,
        handleFinishBlitz, handleToggleSaveQuestion, handleGeneratePlan, handleRecordTelemetry,
        handleRecordPerformance, navigateTo, handleOnboardingNext, handleOnboardingBack,
        handleOnboardingComplete, setTarget, updateTopicProgress, updateProgress, dismissAwardedBadge, clearPreloadedQuestions,
        setShowChangelog, setStudyDetailsModalSession, setTutorModalItem, setLastPerfMetrics
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};