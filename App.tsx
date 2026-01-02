import React, { useState, useEffect } from 'react';
import { INITIAL_PROGRESS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Revise from './pages/Revise';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import { ViewState, UserProgress, Session } from './types';
import SessionManager from './pages/SessionManager';

const App: React.FC = () => {
  // Session State
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('nihongo_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    // Attempt to restore last session
    const lastSessionId = localStorage.getItem('nihongo_last_session_id');
    const savedSessions = localStorage.getItem('nihongo_sessions');
    
    if (lastSessionId && savedSessions) {
        const parsedSessions: Session[] = JSON.parse(savedSessions);
        if (parsedSessions.some(s => s.id === lastSessionId)) {
            return lastSessionId;
        }
    }
    return null;
  });

  // Migration Effect: If no sessions but legacy data exists, create a default session
  useEffect(() => {
    if (sessions.length === 0) {
        const legacyData = localStorage.getItem('nihongo_progress_zen');
        if (legacyData) {
            // Migrating legacy user
            const defaultSession: Session = {
                id: crypto.randomUUID(),
                name: 'Default User',
                lastActive: Date.now()
            };
            setSessions([defaultSession]);
            // Save the session list immediately so next render doesn't loop
            localStorage.setItem('nihongo_sessions', JSON.stringify([defaultSession]));
            
            // Move legacy data to new key
            localStorage.setItem(`nihongo_progress_${defaultSession.id}`, legacyData);
            // Optional: Remove legacy key? localStorage.removeItem('nihongo_progress_zen');
        }
    }
  }, []);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('nihongo_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Persist current session ID
  useEffect(() => {
      if (currentSessionId) {
          localStorage.setItem('nihongo_last_session_id', currentSessionId);
      } else {
          localStorage.removeItem('nihongo_last_session_id');
      }
  }, [currentSessionId]);


  // Session Actions
  const handleCreateSession = (name: string) => {
    const newSession: Session = {
        id: crypto.randomUUID(),
        name,
        lastActive: Date.now()
    };
    setSessions(prev => [...prev, newSession]);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    localStorage.removeItem(`nihongo_progress_${id}`);
    if (currentSessionId === id) {
        setCurrentSessionId(null);
    }
  };

  const handleRenameSession = (id: string, newName: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    // Update last active
    setSessions(prev => prev.map(s => s.id === id ? { ...s, lastActive: Date.now() } : s));
  };
  const handleUpdateSession = (updatedSession: Session) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };


  // If no session selected, show manager
  if (!currentSessionId) {
      return (
          <SessionManager 
            sessions={sessions}
            onCreateSession={handleCreateSession}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
      );
  }

  const currentSession = sessions.find(s => s.id === currentSessionId)!;

  // Render Authenticated App
  return (
    <AuthenticatedApp 
        key={currentSessionId} 
        session={currentSession} 
        onUpdateSession={handleUpdateSession} 
        clearSession={() => setCurrentSessionId(null)} 
    />
  );
};

// Sub-component to isolate state per session
const AuthenticatedApp: React.FC<{ 
    session: Session, 
    onUpdateSession: (s: Session) => void,
    clearSession: () => void 
}> = ({ session, onUpdateSession, clearSession }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize state from session-specific storage
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(`nihongo_progress_${session.id}`);
    if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_PROGRESS, ...parsed };
    }
    return INITIAL_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(`nihongo_progress_${session.id}`, JSON.stringify(progress));
  }, [progress, session.id]);

  const updateProgress = (learnedKana: { type: string, romaji: string }) => {
    const today = new Date().toISOString().split('T')[0];
    const learnId = `${learnedKana.type}-${learnedKana.romaji}`;
    
    setProgress(prev => {
        // Calculate new daily count
        let newCount = prev.dailyProgress.count;
        if (prev.dailyProgress.date === today) {
            newCount += 1;
        } else {
            // New day reset
            newCount = 1;
        }

        return {
            ...prev,
            learned: prev.learned.includes(learnId) ? prev.learned : [...prev.learned, learnId],
            // Also ensure it's removed from revision if we learn it in study mode
            revisionList: prev.revisionList.filter(r => r !== learnId),
            dailyProgress: {
                date: today,
                count: newCount
            }
        };
    });
  };

  const addToRevision = (kana: { type: string, romaji: string }) => {
      const id = `${kana.type}-${kana.romaji}`;
      setProgress(prev => ({
          ...prev,
          revisionList: prev.revisionList.includes(id) ? prev.revisionList : [...prev.revisionList, id]
      }));
  };

  const removeFromRevision = (kana: { type: string, romaji: string }) => {
      const id = `${kana.type}-${kana.romaji}`;
      setProgress(prev => ({
          ...prev,
          revisionList: prev.revisionList.filter(r => r !== id)
      }));
  };

  const unlearnKana = (kana: { type: string, romaji: string }) => {
    const id = `${kana.type}-${kana.romaji}`;
    setProgress(prev => ({
        ...prev,
        learned: prev.learned.filter(l => l !== id)
    }));
  };

  const setDailyGoal = (goal: number) => {
      setProgress(prev => ({
          ...prev,
          settings: { ...prev.settings, dailyGoal: goal }
      }));
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('nihongo_theme')) {
      return localStorage.getItem('nihongo_theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('nihongo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard progress={progress} updateProgress={updateProgress} addToRevision={addToRevision} unlearnKana={unlearnKana} />;
      case ViewState.STUDY:
        return <Study progress={progress} updateProgress={updateProgress} addToRevision={addToRevision} />;
      case ViewState.REVISE:
        return <Revise progress={progress} removeFromRevision={removeFromRevision} />;
      case ViewState.QUIZ:
        return <Quiz progress={progress} addToRevision={addToRevision} />;
      case ViewState.SETTINGS:
        return (
            <Settings 
                progress={progress} 
                setDailyGoal={setDailyGoal} 
                onSwitchSession={clearSession}
                theme={theme}
                toggleTheme={toggleTheme}
                session={session}
                onUpdateSession={onUpdateSession}
            />
        );
      default:
        return <Dashboard progress={progress} updateProgress={updateProgress} addToRevision={addToRevision} unlearnKana={unlearnKana} />;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-screen w-full`}>
        <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
        <Sidebar 
            currentView={currentView} 
            setView={setCurrentView} 
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            theme={theme}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">


            {/* Content Viewport */}
            <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950 transition-colors duration-300 pb-24 md:pb-0 pt-safe">
                {renderContent()}
            </div>
        </main>
        </div>
    </div>
  );
};

export default App;