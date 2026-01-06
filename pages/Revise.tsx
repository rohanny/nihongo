import React, { useState } from 'react';
import { ALL_CHARACTERS } from '../constants';
import Flashcard from '../components/Flashcard';
import { UserProgress } from '../types';
import { Check, Layers } from 'lucide-react';

interface ReviseProps {
  progress: UserProgress;
  removeFromRevision: (kana: { type: string; romaji: string }) => void;
}

const Revise: React.FC<ReviseProps> = ({ progress, removeFromRevision }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter the master list to get full Kana objects for items in revision list
  const reviseList = ALL_CHARACTERS.filter(k => progress.revisionList.includes(`${k.type}-${k.romaji}`));

  if (reviseList.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-950 transition-colors">
              <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 text-zinc-300 dark:text-zinc-600">
                  <Layers size={24} />
              </div>
              <h2 className="text-2xl font-light text-zinc-900 dark:text-white mb-2">No cards to revise</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Great job! Your revision list is empty.</p>
          </div>
      );
  }

  const handleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentChar = reviseList[currentIndex];
    removeFromRevision(currentChar);
    
    // Adjust index if we removed the last item
    if (currentIndex >= reviseList.length - 1) {
        setCurrentIndex(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % reviseList.length);
  };

  const currentKana = reviseList[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-zinc-950 relative p-6 transition-colors">
        <div className="absolute top-8 text-zinc-300 dark:text-zinc-600 text-xs tracking-widest font-mono">
            REVISION QUEUE: {reviseList.length}
        </div>

        <div className="w-full">
            <Flashcard kana={currentKana} />
        </div>

        <div className="w-full max-w-md mt-12 grid grid-cols-2 gap-4">
             <button 
                onClick={handleNext}
                className="flex items-center justify-center gap-3 py-4 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all duration-300 font-medium tracking-wide text-sm"
            >
                Keep
            </button>
            <button 
                onClick={handleMastered}
                className="flex items-center justify-center gap-3 py-4 rounded-full bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-all duration-300 font-medium tracking-wide text-sm shadow-xl shadow-zinc-200/50 dark:shadow-none"
            >
                <Check size={16} />
                Mastered
            </button>
        </div>
    </div>
  );
};

export default Revise;