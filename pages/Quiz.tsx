import React, { useState, useEffect } from 'react';
import { QuizQuestion, UserProgress } from '../types';
import { RotateCcw } from 'lucide-react';
import { ALL_CHARACTERS } from '../constants';
import { generateExtremeRandomQuizQuestion } from '../lib/quizGenerator';
import { generateGeminiQuizQuestion } from '../lib/geminiQuizService';

interface QuizProps {
    progress: UserProgress;
    addToRevision: (kana: { type: string, romaji: string }) => void;
    geminiMode: boolean;
    logQuizResult: (isCorrect: boolean) => void;
}

const Quiz: React.FC<QuizProps> = ({ progress, addToRevision, geminiMode, logQuizResult }) => {
  const [questionData, setQuestionData] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [notEnoughData, setNotEnoughData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Batch processing state
  const [questionQueue, setQuestionQueue] = useState<QuizQuestion[]>([]);
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);
  
  // Clear queue when modes change
  useEffect(() => {
    setQuestionQueue([]);
    setQuestionData(null);
    loadQuestion(true);
  }, [progress.learned, geminiMode]);

  const fetchBatch = async () => {
    if (isFetchingBatch) return;
    
    setIsFetchingBatch(true);
    try {
        // Import dynamically to avoid circular dependencies if any, though regular import is fine here
        const { generateBatchGeminiQuizQuestions } = await import('../lib/geminiQuizService');
        const batch = await generateBatchGeminiQuizQuestions(progress.learned, 5); // Fetch 5 at a time
        
        if (batch && batch.length > 0) {
            setQuestionQueue(prev => [...prev, ...batch]);
        }
    } catch (e) {
        console.error("Error fetching batch", e);
    } finally {
        setIsFetchingBatch(false);
    }
  };

  const loadQuestion = async (forceReset = false) => {
    setSelectedOption(null);
    setIsCorrect(null);
    
    // If not manually forcing reset and we have data
    if (!forceReset && questionData && geminiMode && questionQueue.length > 0) {
        // Just pop from queue locally
        const nextQ = questionQueue[0];
        setQuestionQueue(prev => prev.slice(1));
        setQuestionData(nextQ);
        
        // Background fetch if low
        if (questionQueue.length <= 2) {
            fetchBatch();
        }
        return;
    }

    setIsLoading(true);
    
    try {
      let data: QuizQuestion | null = null;
      
      if (geminiMode) {
        // Check if we have queue
        if (questionQueue.length > 0) {
             data = questionQueue[0];
             setQuestionQueue(prev => prev.slice(1));
             
             // Refill if getting low
             if (questionQueue.length <= 2) {
                 fetchBatch();
             }
        } else {
             // Initial fetch or empty queue
             const { generateBatchGeminiQuizQuestions } = await import('../lib/geminiQuizService');
             const batch = await generateBatchGeminiQuizQuestions(progress.learned, 5);
             
             if (batch && batch.length > 0) {
                 data = batch[0];
                 setQuestionQueue(batch.slice(1));
             }
        }
        
        // Fallback to normal mode if Gemini fails (e.g. no key or error)
        if (!data) {
          console.warn('Gemini quiz generation failed or empty, falling back to normal mode');
          data = generateExtremeRandomQuizQuestion(progress.learned);
        }
      } else {
        // Use normal cryptographic random quiz
        data = generateExtremeRandomQuizQuestion(progress.learned);
      }
      
      if (!data) {
        setNotEnoughData(true);
      } else {
        setNotEnoughData(false);
        setQuestionData(data);
      }
    } catch (error) {
      console.error('Error loading quiz question:', error);
      // Fallback to normal mode on error
      const data = generateExtremeRandomQuizQuestion(progress.learned);
      if (!data) {
        setNotEnoughData(true);
      } else {
        setNotEnoughData(false);
        setQuestionData(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null || !questionData) return;
    
    setSelectedOption(option);
    const correct = option === questionData.correctAnswer;
    setIsCorrect(correct);
    logQuizResult(correct);

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

  if (!questionData || isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 transition-colors">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 dark:text-zinc-400">
          {geminiMode ? 'AI is crafting your question...' : 'Loading question...'}
        </p>
      </div>
    );
  }

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
                onClick={() => loadQuestion()}
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