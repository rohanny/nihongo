import React, { useState, useEffect, useMemo } from 'react';
import { ALL_CHARACTERS } from '../constants';
import Flashcard from '../components/Flashcard';
import { UserProgress, Kana } from '../types';
import { RotateCcw, Check, Lock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyProps {
  progress: UserProgress;
  updateProgress: (newLearned: string) => void;
  addToRevision: (romaji: string) => void;
}

const Study: React.FC<StudyProps> = ({ progress, updateProgress, addToRevision }) => {
  // Session State
  const [sessionQueue, setSessionQueue] = useState<Kana[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Queue
  useEffect(() => {
    if (isInitialized) return; // Only run once per mount

    const today = new Date().toISOString().split('T')[0];
    const dailyCount = progress.dailyProgress.date === today ? progress.dailyProgress.count : 0;
    const remainingQuota = Math.max(0, progress.settings.dailyGoal - dailyCount);

    if (remainingQuota === 0) {
        setSessionComplete(true);
        setIsInitialized(true);
        return;
    }

    // Filter unlearned cards
    const learnedSet = new Set(progress.learned);
    const unlearned = ALL_CHARACTERS.filter(c => !learnedSet.has(`${c.type}-${c.romaji}`));

    // Take only what's needed for today
    const queue = unlearned.slice(0, remainingQuota);
    setSessionQueue(queue);
    
    // If we have quota but no unlearned cards left (completed all Kana)
    if (queue.length === 0 && unlearned.length === 0) {
        setSessionComplete(true); 
    }

    setIsInitialized(true);
  }, [progress, isInitialized]);

  const handleNext = () => {
    if (currentIndex >= sessionQueue.length - 1) {
        setSessionComplete(true);
    } else {
        setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSeen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentKana = sessionQueue[currentIndex];
    
    // Mark as learned
    updateProgress(currentKana);
    
    handleNext();
  };

  const handleRevise = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentKana = sessionQueue[currentIndex];
    
    // Add to revision list
    addToRevision(currentKana);
    
    // Even if added to revision, we count it as "processed" for this session step
    handleNext();
  };

  if (!isInitialized) {
      return null; // Or a loading spinner
  }

  // Completed State (Either Daily Goal Reached OR No more cards)
  if (sessionComplete) {
      const today = new Date().toISOString().split('T')[0];
      const dailyCount = progress.dailyProgress.date === today ? progress.dailyProgress.count : 0;
      const isQuotaFull = dailyCount >= progress.settings.dailyGoal;

      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 transition-colors">
              <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                  {isQuotaFull ? (
                      <Lock className="text-zinc-400 dark:text-zinc-500" size={24} />
                  ) : (
                      <Trophy className="text-zinc-400 dark:text-zinc-500" size={24} />
                  )}
              </div>
              <h2 className="text-2xl font-light text-zinc-900 dark:text-white mb-2">
                  {isQuotaFull ? "Daily Goal Reached" : "All Caught Up!"}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs mx-auto">
                  You've studied {dailyCount} cards today. 
                  {isQuotaFull 
                    ? " Great consistency! Come back tomorrow." 
                    : " You've learned all available characters!"}
              </p>
          </div>
      )
  }

  const currentKana = sessionQueue[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-zinc-950 relative p-6 transition-colors">
        {/* Top bar info */}
        <div className="absolute top-8 w-full max-w-md flex justify-between items-center text-xs tracking-widest font-mono text-zinc-300 dark:text-zinc-600 px-4">
            <span>SESSION: {currentIndex + 1} / {sessionQueue.length}</span>
            <span>NEW</span>
        </div>

        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentKana.romaji}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Flashcard kana={currentKana} />
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md mt-12 grid grid-cols-2 gap-4">
            <button 
                onClick={handleRevise}
                className="flex items-center justify-center gap-3 py-4 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all duration-300 font-medium tracking-wide text-sm group"
            >
                <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500"/>
                Revise
            </button>
            
            <button 
                onClick={handleSeen}
                className="flex items-center justify-center gap-3 py-4 rounded-full bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-all duration-300 font-medium tracking-wide text-sm shadow-xl shadow-zinc-200/50 dark:shadow-none"
            >
                <Check size={16} />
                Seen
            </button>
        </div>
    </div>
  );
};

export default Study;