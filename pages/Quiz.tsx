import React, { useState, useEffect } from 'react';
import { QuizQuestion, UserProgress } from '../types';
import { RotateCcw } from 'lucide-react';
import { ALL_CHARACTERS } from '../constants';

const generateLocalQuizQuestion = (learned: string[]): QuizQuestion | null => {
    if (learned.length < 4) return null;

    // 1. Pick a random correct answer from learned items
    const correctId = learned[Math.floor(Math.random() * learned.length)];
    const correctFilter = ALL_CHARACTERS.find(c => `${c.type}-${c.romaji}` === correctId);

    if (!correctFilter) return null;

    // 2. Pick 3 distractors from ALL_CHARACTERS (excluding the correct one)
    const distractors: string[] = [];
    while (distractors.length < 3) {
        const randomChar = ALL_CHARACTERS[Math.floor(Math.random() * ALL_CHARACTERS.length)];
        if (randomChar.romaji !== correctFilter.romaji && !distractors.includes(randomChar.romaji)) {
            distractors.push(randomChar.romaji);
        }
    }

    // 3. Shuffle options
    const options = [correctFilter.romaji, ...distractors].sort(() => Math.random() - 0.5);

    return {
        question: correctFilter.char, // Show Kana
        targetChar: correctFilter.char,
        correctAnswer: correctFilter.romaji, // User guesses Romaji (or vice versa, assuming standard quiz)
        options: options
    };
};

interface QuizProps {
    progress: UserProgress;
    addToRevision: (romaji: string) => void;
}

const Quiz: React.FC<QuizProps> = ({ progress, addToRevision }) => {
  const [questionData, setQuestionData] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [notEnoughData, setNotEnoughData] = useState(false);

  const loadQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    
    const data = generateLocalQuizQuestion(progress.learned);
    if (!data) {
        setNotEnoughData(true);
    } else {
        setNotEnoughData(false);
        setQuestionData(data);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [progress.learned]);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null || !questionData) return;
    
    setSelectedOption(option);
    const correct = option === questionData.correctAnswer;
    setIsCorrect(correct);

    if (!correct) {
        // Failed quiz -> Add to Revision
        // We need to find the full Kana object for the correct answer to add it to revision
        const kana = ALL_CHARACTERS.find(c => c.romaji === questionData.correctAnswer && questionData.targetChar === c.char); // Double check to be safe
        if (kana) addToRevision(kana);
    }

    // Auto-advance if correct after a short delay for flow
    if (correct) {
        setTimeout(loadQuestion, 800);
    }
  };

  if (notEnoughData) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 transition-colors">
              <h2 className="text-2xl font-light text-zinc-900 dark:text-white mb-2">Keep Studying</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs">You need to mark at least 4 characters as "Seen" in Study mode before you can take the quiz.</p>
          </div>
      );
  }

  if (!questionData) return null;

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-6">
      <div className="mb-16 text-center">
         <span className="text-zinc-300 dark:text-zinc-600 text-xs tracking-[0.3em] uppercase mb-8 block">Identification</span>
         <div className="text-9xl font-thin text-zinc-900 dark:text-white japanese-text mb-4 transition-colors">
            {questionData.targetChar}
         </div>
         <div className={`h-1 w-12 mx-auto rounded-full transition-colors duration-300 ${
             isCorrect === true ? 'bg-black dark:bg-white' : 
             isCorrect === false ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-transparent'
         }`} />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {questionData.options.map((option, idx) => {
           const isSelected = selectedOption === option;
           const isCorrectAnswer = option === questionData.correctAnswer;
           
           let btnStyle = "border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300";
           
           if (selectedOption !== null) {
               if (isCorrectAnswer) {
                   btnStyle = "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black";
               } else if (isSelected) {
                   btnStyle = "border-zinc-200 text-zinc-300 bg-zinc-50 decoration-line-through dark:border-zinc-800 dark:text-zinc-600 dark:bg-zinc-900";
               } else {
                   btnStyle = "border-transparent text-zinc-200 dark:text-zinc-800 opacity-20";
               }
           }

           return (
             <button
               key={idx}
               onClick={() => handleOptionClick(option)}
               disabled={selectedOption !== null}
               className={`
                   h-20 text-xl font-light rounded-2xl border transition-all duration-300
                   ${btnStyle}
               `}
             >
               {option}
             </button>
           );
        })}
      </div>
      
      {/* Manual advance if wrong */}
      {isCorrect === false && (
          <div className="mt-12 flex flex-col items-center animate-fade-in">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Added to Revision Queue</p>
              <button 
                onClick={loadQuestion}
                className="flex items-center gap-2 px-6 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors text-sm"
              >
                <RotateCcw size={14} /> Continue
              </button>
          </div>
      )}
    </div>
  );
};

export default Quiz;