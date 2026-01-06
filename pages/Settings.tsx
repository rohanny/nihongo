import React, { useRef, useState, useEffect } from 'react';
import { UserProgress, Session } from '../types';
import Report from '../components/Report';
import { User, Upload, Monitor, Pencil, Check, X, BarChart2 } from 'lucide-react';
import { SunIcon } from '../components/ui/sun';
import { MoonIcon } from '../components/ui/moon';
import { LogoutIcon } from '../components/ui/logout';
import { BotIcon } from '../components/ui/bot';

interface SettingsProps {
  progress: UserProgress;
  session: Session;
  setDailyGoal: (goal: number) => void;
  onSwitchSession: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onUpdateSession: (session: Session) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    progress, 
    session,
    setDailyGoal, 
    onSwitchSession,
    theme,
    toggleTheme,
    onUpdateSession
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Renaming state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(session.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Report View State
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
      if (isEditingName && nameInputRef.current) {
          nameInputRef.current.focus();
      }
  }, [isEditingName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // ... same
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024) { // 1MB limit
              alert("Image size must be less than 1MB");
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              onUpdateSession({ ...session, avatar: base64 });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveName = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (editName.trim()) {
          onUpdateSession({ ...session, name: editName.trim() });
          setIsEditingName(false);
      }
  };

  const handleCancelEdit = () => {
      setEditName(session.name);
      setIsEditingName(false);
  };

  // Render Report sub-view
  if (showReport) {
      return (
          <Report progress={progress} onBack={() => setShowReport(false)} />
      );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-50 mb-12">Preferences</h2>

        <div className="w-full max-w-md space-y-6">
            
            {/* Profile Card (Horizontal) */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                 {/* ... Avatar code ... */}
                 <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                     <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-zinc-950 shadow-md transition-transform hover:scale-105">
                         {session.avatar ? (
                             <img src={session.avatar} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                             <BotIcon size={32} className="text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                         )}
                     </div>
                     <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Upload size={16} className="text-white" />
                     </div>
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                 />

                 {/* Name & Edit Logic */}
                 <div className="flex-1 min-w-0">
                     {isEditingName ? (
                         <form onSubmit={handleSaveName} className="flex items-center gap-2">
                             <input 
                                ref={nameInputRef}
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-full outline-none font-medium text-lg py-1 text-zinc-900 dark:text-zinc-50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                             />
                             <button type="submit" className="text-green-500 hover:text-green-600"><Check size={18}/></button>
                             <button type="button" onClick={handleCancelEdit} className="text-red-400 hover:text-red-500"><X size={18}/></button>
                         </form>
                     ) : (
                         <div 
                            className="flex flex-col justify-center cursor-pointer group/name"
                            onClick={() => {
                                setEditName(session.name);
                                setIsEditingName(true);
                            }}
                         >
                            <h3 className="font-medium text-lg text-zinc-900 dark:text-zinc-50 truncate group-hover/name:text-black dark:group-hover/name:text-white transition-colors flex items-center gap-2">
                                {session.name}
                                <Pencil size={14} className="opacity-0 group-hover/name:opacity-50 transition-opacity text-zinc-400" />
                            </h3>
                         </div>
                     )}
                 </div>

                 {/* Actions */}
                 {!isEditingName && (
                     <div className="flex items-center gap-2">
                        <button 
                            onClick={onSwitchSession}
                            className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            title="Switch Profile"
                        >
                            <LogoutIcon size={18} />
                        </button>
                     </div>
                 )}
            </div>

            {/* Status Report Link */}
            <button 
                onClick={() => setShowReport(true)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        <BarChart2 size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block text-zinc-900 dark:text-zinc-50 font-medium">Status Report</span>
                        <span className="text-zinc-400 text-xs">View your study history & analytics</span>
                    </div>
                </div>
                <div className="text-zinc-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform">
                    →
                </div>
            </button>


            {/* Theme */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                     <span className="block text-zinc-900 dark:text-zinc-50 font-medium text-sm">Appearance</span>
                     <span className="text-zinc-400 text-xs">Toggle light or dark mode</span>
                </div>
                <button 
                    onClick={toggleTheme}
                    className="bg-zinc-200 dark:bg-zinc-800 p-1 rounded-full flex items-center gap-1 relative w-16 h-8 transition-colors"
                >
                     <div className={`absolute w-6 h-6 rounded-full bg-white dark:bg-zinc-600 shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-9' : 'left-1'}`} />
                     <div className="flex-1 flex justify-center text-zinc-500 dark:text-zinc-600 z-10 text-[10px]"><SunIcon size={12}/></div>
                     <div className="flex-1 flex justify-center text-zinc-400 dark:text-zinc-400 z-10 text-[10px]"><MoonIcon size={12}/></div>
                </button>
            </div>
            
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