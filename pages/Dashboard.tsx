import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProgress, Kana } from '../types';
import Flashcard from '../components/Flashcard';
import { ALL_CHARACTERS } from '../constants';
import { RotateCcw, Check } from 'lucide-react';
import { CheckIcon } from '../components/ui/check';

interface DashboardProps {
  progress: UserProgress;
  updateProgress: (kana: { type: string; romaji: string }) => void;
  addToRevision: (kana: { type: string; romaji: string }) => void;
  unlearnKana: (kana: { type: string; romaji: string }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, updateProgress, addToRevision, unlearnKana }) => {
  const learnedSet = new Set(progress.learned);
  const total = ALL_CHARACTERS.length;
  const count = learnedSet.size;

  // Group characters by type
  const groups = {
    hiragana: ALL_CHARACTERS.filter(c => c.type === 'hiragana'),
    katakana: ALL_CHARACTERS.filter(c => c.type === 'katakana'),
    kanji: ALL_CHARACTERS.filter(c => c.type === 'kanji'),
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const [selectedKana, setSelectedKana] = React.useState<Kana | null>(null);

  return (
    <div className="h-full flex flex-col items-center p-8 md:p-12 max-w-5xl mx-auto overflow-hidden relative">
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">
          {count} <span className="text-zinc-300 dark:text-zinc-700">/</span> {total}
        </h2>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm uppercase tracking-widest transition-colors">Characters Collected</p>
      </div>

      <motion.div 
        className="flex-1 overflow-y-auto w-full pr-2 space-y-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {Object.entries(groups).map(([type, chars]) => {
          if (chars.length === 0) return null;
          
          return (
            <motion.div key={type} className="w-full" variants={item}>
              <h3 className="text-zinc-300 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2 transition-colors">
                {type}
              </h3>
              <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {chars.map((kana) => {
                  const id = `${kana.type}-${kana.romaji}`;
                  const isLearned = learnedSet.has(id);
                  const isInRevision = progress.revisionList.includes(id);
                  
                  return (
                    <motion.div

                      onClick={() => setSelectedKana(kana)}
                      key={`${kana.type}-${kana.romaji}`}
                      className={`
                        aspect-square flex items-center justify-center text-xl md:text-2xl rounded-xl transition-colors duration-500 japanese-text relative group cursor-pointer
                        ${isInRevision
                            ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                            : isLearned 
                                ? 'bg-black text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900' 
                                : 'bg-zinc-50 text-zinc-200 dark:bg-zinc-900 dark:text-zinc-800'
                        }
                      `}
                      title={`${kana.romaji}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {kana.char}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
        
        {/* Bottom padding for scrolling */}
        <div className="h-12"></div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
          {selectedKana && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                  <motion.div 
                      key="backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      onClick={() => setSelectedKana(null)}
                      className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm"
                  />
                  
                  <div className="relative z-10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                        className="w-full"
                        style={{ borderRadius: 24 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                         <Flashcard kana={selectedKana} />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                        className="w-full mt-6 grid grid-cols-2 gap-4"
                    >
                        <button 
                                onClick={(e) => {
                                e.stopPropagation();
                                const id = `${selectedKana.type}-${selectedKana.romaji}`;
                                addToRevision(selectedKana);
                                setSelectedKana(null);
                            }}
                            className={`flex items-center justify-center gap-3 py-4 rounded-full border transition-all duration-300 font-medium tracking-wide text-sm group
                                ${progress.revisionList.includes(`${selectedKana.type}-${selectedKana.romaji}`)
                                    ? 'border-zinc-200 bg-zinc-200 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                                    : 'border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-black/50 backdrop-blur-md text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }
                            `}
                        >
                            <RotateCcw size={16} className={progress.revisionList.includes(`${selectedKana.type}-${selectedKana.romaji}`) ? "" : "group-hover:-rotate-180 transition-transform duration-500"}/>
                            {progress.revisionList.includes(`${selectedKana.type}-${selectedKana.romaji}`) ? 'In Revision' : 'Revise'}
                        </button>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                const id = `${selectedKana.type}-${selectedKana.romaji}`;
                                if (learnedSet.has(id)) {
                                    unlearnKana(selectedKana);
                                } else {
                                    updateProgress(selectedKana);
                                }
                                setSelectedKana(null);
                            }}
                            className={`flex items-center justify-center gap-3 py-4 rounded-full transition-all duration-300 font-medium tracking-wide text-sm shadow-xl shadow-zinc-200/50 dark:shadow-none
                                ${learnedSet.has(selectedKana.romaji)
                                    ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                                    : 'bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-300'
                                }
                            `}
                        >
                            <CheckIcon size={16} />
                            {learnedSet.has(`${selectedKana.type}-${selectedKana.romaji}`) ? 'Learned' : 'Mark Seen'}
                        </button>
                    </motion.div>
                  </div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;