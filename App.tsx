import React from 'react';
import { AppProvider, useAppContext } from './state/AppContext';
import { FlowController } from './components/FlowController';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import SelectionPage from './components/SelectionPage';
import TopicBlitzBuilderPage from './components/TopicBlitzBuilderPage';
import BlitzSessionPage from './components/BlitzSessionPage';
import FeedbackPage from './components/FeedbackPage';
import RevisionPlanPage from './components/RevisionPlanPage';
import TutorChatModal from './components/TutorChatModal';
import ReviewPage from './components/ReviewPage';
import AnalyticsPage from './components/AnalyticsPage';
import PerformanceMonitor from './components/PerformanceMonitor';
import Changelog from './components/Changelog';
import WhatsNewPopup from './components/WhatsNewPopup';
import ParentDashboard from './components/ParentDashboard';
import OnboardingWelcome from './components/onboarding/OnboardingWelcome';
import OnboardingGoal from './components/onboarding/OnboardingGoal';
import OnboardingSubjects from './components/onboarding/OnboardingSubjects';
import OnboardingMotivation from './components/onboarding/OnboardingMotivation';
import OnboardingPlan from './components/onboarding/OnboardingPlan';
import OnboardingTour from './components/onboarding/OnboardingTour';
import OnboardingTrial from './components/onboarding/OnboardingTrial';
import OnboardingSuccess from './components/onboarding/OnboardingSuccess';
import WeeklyPlannerPage from './components/WeeklyPlannerPage';
import StudyDetailsModal from './components/StudyDetailsModal';
import MockExamPage from './components/MockExamPage';
import FlashcardsPage from './components/FlashcardsPage';
import AiCoachPage from './components/AiCoachPage';
import ProfilePage from './components/ProfilePage';
import HandoverPage from './components/HandoverPage';
import NeumoShowcase from './pages/NeumoShowcase';
import ThemeShowcase from './pages/ThemeShowcase';
import SubjectPage from './components/SubjectPage';
import { getAchievements } from './state/badges';
import LevelUpOverlay from './components/ui/LevelUpOverlay';
import FeedbackPageSkeleton from './components/FeedbackPageSkeleton';

// This component lives inside the AppProvider and handles rendering the badge overlay
const BadgeDisplayManager: React.FC = () => {
    const { awardedBadge, dismissAwardedBadge } = useAppContext();

    if (!awardedBadge) {
        return null;
    }

    return (
        <LevelUpOverlay
            key={awardedBadge.id} // Ensures the component re-mounts for new badges
            title={awardedBadge.title}
            subtitle={awardedBadge.description}
            icon={awardedBadge.icon}
            onClose={dismissAwardedBadge}
        />
    );
};

// This component now holds only rendering logic, getting all state from the context.
const AppContent: React.FC = () => {
    const {
        // State
        user, page, pageContext, feedbackSession, savedQuestions, tutorModalItem,
        isGeneratingPlan, telemetryEvents, lastPerfMetrics, performanceHistory,
        showChangelog, studyDetailsModalSession, onboardingStep, onboardingTourMessage,
        revisionPlan, examConfig, userSelections, topicMastery, studentState,
        
        // Handlers
        handleAuth, handleStartBlitz, handleToggleSaveQuestion,
        handleGeneratePlan, handleRecordTelemetry, handleOnboardingNext,
        handleOnboardingBack, handleOnboardingComplete, setShowChangelog,
        setStudyDetailsModalSession, setTutorModalItem, setLastPerfMetrics, navigateTo,
        handleFinishBlitz, handleSelectionComplete, handleRecordPerformance
    } = useAppContext();

    
    const renderOnboardingStep = () => {
        switch (onboardingStep) {
            case 1: return <OnboardingWelcome onNext={handleOnboardingNext} />;
            case 2: return <OnboardingGoal onNext={handleOnboardingNext} onBack={handleOnboardingBack} />;
            case 3: return <OnboardingSubjects onNext={handleOnboardingNext} onBack={handleOnboardingBack} />;
            case 4: return <OnboardingMotivation onNext={handleOnboardingNext} onBack={handleOnboardingBack} />;
            case 5: return <OnboardingPlan onNext={handleOnboardingNext} onBack={handleOnboardingBack} />;
            case 6: return null; // Handled by persistent component
            case 7: return <OnboardingTrial onNext={handleOnboardingNext} onBack={handleOnboardingBack} />;
            case 8: return <OnboardingSuccess onComplete={handleOnboardingComplete} />;
            default: return <OnboardingWelcome onNext={handleOnboardingNext} />;
        }
    };

    const renderPage = () => {
        if (!user) return <AuthPage onAuth={handleAuth} />;

        switch (page) {
            case 'onboarding': return renderOnboardingStep();
            case 'selection': return <SelectionPage onSelectionComplete={handleSelectionComplete} />;
            case 'blitzBuilder': return <TopicBlitzBuilderPage onStartBlitz={handleStartBlitz} onBack={() => navigateTo('landing')} userSelections={userSelections} />;
            case 'blitzSession': return <BlitzSessionPage config={examConfig!} user={user} topicMastery={topicMastery} onRecordPerformance={handleRecordPerformance} />;
            case 'feedback':
                if (!feedbackSession) {
                    return <FeedbackPageSkeleton />;
                }
                return <FeedbackPage session={feedbackSession} onViewAnalytics={() => navigateTo('analytics')} savedQuestions={savedQuestions} onToggleSave={handleToggleSaveQuestion} onAskTutor={(item) => setTutorModalItem(item)} onGeneratePlan={handleGeneratePlan} isGeneratingPlan={isGeneratingPlan} user={user} onRecordTelemetry={handleRecordTelemetry} />;
            case 'revisionPlan': return null; // Handled by persistent component
            case 'review': return <ReviewPage savedQuestions={savedQuestions} onBack={() => navigateTo('landing')} onToggleSave={handleToggleSaveQuestion} onAskTutor={(item) => setTutorModalItem(item)} user={user} onRecordTelemetry={handleRecordTelemetry} />;
            case 'analytics': return <AnalyticsPage achievements={getAchievements()} telemetryEvents={telemetryEvents} onBack={() => navigateTo('landing')} userSelections={userSelections} />;
            case 'parentDashboard': return <ParentDashboard user={user} onBack={() => navigateTo('landing')} />;
            case 'weekly-planner': return <WeeklyPlannerPage userSelections={userSelections} onNewSession={() => {}} onShowDetails={(session) => setStudyDetailsModalSession(session)} />;
            case 'mock-exam': return <MockExamPage onBack={() => navigateTo('landing')} />;
            case 'flashcards': return <FlashcardsPage />;
            case 'ai-coach': return <AiCoachPage user={user} />;
            case 'profile': return <ProfilePage user={user} topicMastery={topicMastery} onNavigateToAnalytics={() => navigateTo('analytics')} userSelections={userSelections} />;
            case 'subject': return <SubjectPage subjectId={pageContext} onBack={() => navigateTo('landing')} />;
            case 'handover': return <HandoverPage />;
            case 'neumo-showcase': return <NeumoShowcase onBack={() => navigateTo('landing')} />;
            case 'theme-showcase': return <ThemeShowcase onBack={() => navigateTo('landing')} />;
            case 'landing':
            default:
                return <LandingPage onStartPractice={() => navigateTo('blitzBuilder')} onStartMockExam={() => navigateTo('mock-exam')} onStartFlashcards={() => navigateTo('flashcards')} onStartAiCoach={() => navigateTo('ai-coach')} userSelections={userSelections} onEditSelections={() => navigateTo('selection')} onViewAnalytics={() => navigateTo('analytics')} />;
        }
    };

    const showOnboardingTour = page === 'onboarding' && onboardingStep === 6;
    const showRevisionPlan = page === 'revisionPlan';

    return (
         <FlowController 
            navigateTo={navigateTo} 
            onFinishBlitz={handleFinishBlitz}
            onGoHome={() => navigateTo('landing')}
            studentState={studentState}
        >
            <div className="app-container">
                {/* Standard page container */}
                <div style={{ display: showOnboardingTour || showRevisionPlan ? 'none' : 'block' }}>
                    {renderPage()}
                </div>
                
                {/* Persistently mounted components */}
                <div style={{ display: showOnboardingTour ? 'block' : 'none' }}>
                    <OnboardingTour introMessage={onboardingTourMessage} onNext={handleOnboardingNext} onBack={handleOnboardingBack} />
                </div>
                
                <div style={{ display: showRevisionPlan ? 'block' : 'none' }}>
                    {revisionPlan && <RevisionPlanPage plan={revisionPlan} onBack={() => navigateTo('feedback')} />}
                </div>

                {/* Modals and Overlays */}
                {tutorModalItem && <TutorChatModal isOpen={!!tutorModalItem} onClose={() => setTutorModalItem(null)} questionItem={tutorModalItem} user={user!} />}
                {lastPerfMetrics && <PerformanceMonitor metrics={lastPerfMetrics} history={performanceHistory} optimizations={{ preGeneration: false, progressiveRender: true }} onClose={() => setLastPerfMetrics(null)} />}
                <WhatsNewPopup onOpenChangelog={() => setShowChangelog(true)} />
                <Changelog isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
                <StudyDetailsModal session={studyDetailsModalSession} onClose={() => setStudyDetailsModalSession(null)} />
            </div>
        </FlowController>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
            <BadgeDisplayManager />
        </AppProvider>
    );
};

export default App;
