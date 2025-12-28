import React, { useState, useEffect } from 'react';
import { ViewState, UserProgress } from './types';
import { INITIAL_PROGRESS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Revise from './pages/Revise';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize state with fallback for new fields if local storage is old
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('nihongo_progress_zen');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial to ensure new fields like revisionList exist
        return { ...INITIAL_PROGRESS, ...parsed };
    }
    return INITIAL_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem('nihongo_progress_zen', JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (learnedRomaji: string) => {
    const today = new Date().toISOString().split('T')[0];
    
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
            learned: prev.learned.includes(learnedRomaji) ? prev.learned : [...prev.learned, learnedRomaji],
            // Also ensure it's removed from revision if we learn it in study mode
            revisionList: prev.revisionList.filter(r => r !== learnedRomaji),
            dailyProgress: {
                date: today,
                count: newCount
            }
        };
    });
  };

  const addToRevision = (romaji: string) => {
      setProgress(prev => ({
          ...prev,
          revisionList: prev.revisionList.includes(romaji) ? prev.revisionList : [...prev.revisionList, romaji]
      }));
  };

  const removeFromRevision = (romaji: string) => {
      setProgress(prev => ({
          ...prev,
          revisionList: prev.revisionList.filter(r => r !== romaji)
      }));
  };

  const unlearnKana = (romaji: string) => {
    setProgress(prev => ({
        ...prev,
        learned: prev.learned.filter(l => l !== romaji)
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
        return <Settings progress={progress} setDailyGoal={setDailyGoal} />;
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
            toggleTheme={toggleTheme}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Mobile Top Header (Logo Only) */}
            <div className="md:hidden pt-6 pb-2 px-6 bg-white dark:bg-zinc-950 flex items-center justify-between transition-colors z-10 shrink-0">
                 <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-serif font-bold text-sm">
                    日
                 </div>
                 {/* Optional: Add a title or progress summary here later if needed */}
            </div>

            {/* Content Viewport */}
            <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950 transition-colors duration-300 pb-24 md:pb-0">
                {renderContent()}
            </div>
        </main>
        </div>
    </div>
  );
};

export default App;