import React from 'react';
import { UserProgress } from '../types';

interface SettingsProps {
  progress: UserProgress;
  setDailyGoal: (goal: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ progress, setDailyGoal }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-50 mb-12">Preferences</h2>

        <div className="w-full max-w-md space-y-6">
            
            {/* Daily Goal */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 transition-colors">
                <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
                    Daily Study Goal
                </label>
                <div className="flex items-center gap-6">
                    <input 
                        type="range" 
                        min="3" 
                        max="20" 
                        step="1"
                        value={progress.settings.dailyGoal}
                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                        className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                    />
                    <span className="text-3xl font-thin text-zinc-900 dark:text-zinc-50 w-12 text-right">
                        {progress.settings.dailyGoal}
                    </span>
                </div>
                <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
                    Controls the number of *new* cards you can mark as "Seen" per day. Reviewing old cards is always unlimited.
                </p>
            </div>
        </div>
    </div>
  );
};

export default Settings;