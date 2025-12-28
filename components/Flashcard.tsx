import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Kana } from '../types';

interface FlashcardProps {
  kana: Kana;
}

const Flashcard: React.FC<FlashcardProps> = ({ kana }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [kana]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div className="w-full max-w-md mx-auto h-[32rem] cursor-pointer group perspective-1000" onClick={handleFlip}>
      <motion.div 
        className="relative w-full h-full transform-style-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-zinc-900 flex flex-col items-center justify-center p-8 border border-zinc-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl transition-colors">
          <div className="absolute top-8 text-xs font-medium text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em]">
            {kana.group}
          </div>
          <h2 className="text-9xl font-thin text-zinc-900 dark:text-white japanese-text mb-8">{kana.char}</h2>
          <div className="absolute bottom-8 w-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-zinc-900 dark:bg-zinc-800 text-white flex flex-col items-center justify-center p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-8xl font-thin mb-4 tracking-tighter">{kana.romaji}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium tracking-widest uppercase">Pronunciation</p>
        </div>

      </motion.div>
    </div>
  );
};

export default Flashcard;