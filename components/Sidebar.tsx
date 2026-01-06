import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ViewState } from '../types';
import { GripIcon } from './ui/grip';
import { LayersIcon } from './ui/layers';
import { ZapIcon } from './ui/zap';
import { RefreshCWIcon } from './ui/refresh-cw';
import { SettingsIcon } from './ui/settings';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  geminiMode: boolean;
  setGeminiMode: (mode: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, theme, geminiMode, setGeminiMode }) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const HOLD_DURATION = 2000; // 2 seconds

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Grid', icon: GripIcon },
    { id: ViewState.STUDY, label: 'Study', icon: LayersIcon },
    { id: ViewState.REVISE, label: 'Revise', icon: RefreshCWIcon },
    { id: ViewState.QUIZ, label: 'Test', icon: ZapIcon },
    { id: ViewState.SETTINGS, label: 'Setup', icon: SettingsIcon },
  ];

  const handleQuizPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setView(ViewState.QUIZ);
  };

  const handleQuizHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Start progress animation
    const startTime = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 16); // ~60fps

    // Set timer to toggle mode after 2 seconds
    holdTimerRef.current = setTimeout(() => {
      setGeminiMode(!geminiMode);
      setHoldProgress(0);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    }, HOLD_DURATION);
  };

  const handleQuizHoldEnd = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
  };
  // Gemini brand colors - Minimalist Monochrome
  const geminiColors = {
    light: '#000000',
    dark: '#ffffff'
  };

  // Gradient for the "magic" hold effect
  const geminiGradient = {
    light: 'linear-gradient(135deg, #4796E3 0%, #9177C7 50%, #CA6673 100%)',
    dark: 'linear-gradient(135deg, #4796E3 0%, #9177C7 50%, #CA6673 100%)'
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <div className="hidden md:flex sticky top-0 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 z-30 w-20 flex-col items-center py-8 transition-colors duration-300">
        <div className="mb-12">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-serif font-bold text-lg">
            日
          </div>
        </div>

        <nav className="space-y-6 w-full px-4 flex flex-col items-center flex-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const isQuiz = item.id === ViewState.QUIZ;
            const showGeminiStyle = isQuiz && geminiMode;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={isQuiz ? handleQuizPress : () => setView(item.id)}
                  onMouseDown={isQuiz ? handleQuizHoldStart : undefined}
                  onMouseUp={isQuiz ? handleQuizHoldEnd : undefined}
                  onMouseLeave={isQuiz ? handleQuizHoldEnd : undefined}
                  onTouchStart={isQuiz ? handleQuizHoldStart : undefined}
                  onTouchEnd={isQuiz ? handleQuizHoldEnd : undefined}
                  className={`
                    group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 overflow-hidden
                    ${isActive && !showGeminiStyle
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : !showGeminiStyle
                      ? 'text-zinc-300 hover:text-black hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-900'
                      : ''
                    }
                  `}
                  style={showGeminiStyle && isActive ? {
                    background: geminiColors[theme],
                    color: theme === 'dark' ? 'black' : 'white'
                  } : {}}
                  aria-label={item.label}
                >
                  {/* Hold progress indicator */}
                  {isQuiz && holdProgress > 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: geminiGradient[theme],
                        opacity: 0.3
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: holdProgress / 100 }}
                      transition={{ duration: 0.05 }}
                    />
                  )}
                  
                  <item.icon size={20} className="relative z-10" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-14 bg-black text-white dark:bg-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {isQuiz && geminiMode && ' (AI)'}
                  </span>
                </button>
                
                {/* Gemini mode indicator dot */}
                {isQuiz && geminiMode && (
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950"
                    style={{ background: geminiGradient[theme] }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* --- MOBILE FLOATING DOCK (Visible on Mobile) --- */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 z-[100] p-1.5 flex items-center gap-1 rounded-full shadow-2xl safe-area-bottom">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const isQuiz = item.id === ViewState.QUIZ;
            const showGeminiStyle = isQuiz && geminiMode;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={isQuiz ? handleQuizPress : () => setView(item.id)}
                  onTouchStart={isQuiz ? handleQuizHoldStart : undefined}
                  onTouchEnd={isQuiz ? handleQuizHoldEnd : undefined}
                  className={`
                    flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-300 overflow-hidden
                    ${isActive && !showGeminiStyle
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                      : !showGeminiStyle
                      ? 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      : ''
                    }
                  `}
                  style={showGeminiStyle && isActive ? {
                    background: geminiColors[theme],
                    color: theme === 'dark' ? 'black' : 'white'
                  } : {}}
                >
                  {/* Hold progress indicator */}
                  {isQuiz && holdProgress > 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: geminiGradient[theme],
                        opacity: 0.3
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: holdProgress / 100 }}
                      transition={{ duration: 0.05 }}
                    />
                  )}
                  
                  <item.icon size={18} className="relative z-10" />
                </button>
                
                {/* Gemini mode indicator dot */}
                {isQuiz && geminiMode && (
                  <div 
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900"
                    style={{ background: geminiGradient[theme] }}
                  />
                )}
              </div>
            );
          })}
      </div>
    </>
  );
};
export default Sidebar;
