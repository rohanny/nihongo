import React from 'react';
import { motion } from 'framer-motion';
import { ViewState } from '../types';
import { Grid, Layers, Zap, RotateCcw, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, theme }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Grid', icon: Grid },
    { id: ViewState.STUDY, label: 'Study', icon: Layers },
    { id: ViewState.REVISE, label: 'Revise', icon: RotateCcw },
    { id: ViewState.QUIZ, label: 'Test', icon: Zap },
    { id: ViewState.SETTINGS, label: 'Setup', icon: SettingsIcon },
  ];

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
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`
                  group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-colors duration-300
                  ${isActive 
                    ? 'bg-black text-white dark:bg-white dark:text-black' 
                    : 'text-zinc-300 hover:text-black hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-900'
                  }
                `}
                aria-label={item.label}
              >
                <item.icon size={20} strokeWidth={1.5} />
                
                {/* Tooltip */}
                <span className="absolute left-14 bg-black text-white dark:bg-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* --- MOBILE FLOATING DOCK (Visible on Mobile) --- */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 z-[100] p-1.5 flex items-center gap-1 rounded-full shadow-2xl safe-area-bottom">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`
                  flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                    : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              </button>
            );
          })}
      </div>
    </>
  );
};
export default Sidebar;