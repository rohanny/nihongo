import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, ArrowRight, Pencil, X, Check } from 'lucide-react';
import { Session } from '../types';

interface SessionManagerProps {
  sessions: Session[];
  onCreateSession: (name: string) => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onCreateSession, onSelectSession, onDeleteSession, onRenameSession }) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [newSessionName, setNewSessionName] = useState('');
  
  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [editingId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      onCreateSession(newSessionName.trim());
      setNewSessionName('');
      setViewMode('list');
    }
  };

  const startEditing = (session: Session, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(session.id);
      setEditName(session.name);
  };

  const saveEdit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (editingId && editName.trim()) {
          onRenameSession(editingId, editName.trim());
          setEditingId(null);
      }
  };

  const cancelEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(null);
  };

  // --- CREATE MODE (ZEN) ---
  if (viewMode === 'create') {
      return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-zinc-50 transition-colors">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full max-w-lg text-center"
            >
                <h2 className="text-2xl font-light mb-8 text-zinc-400 dark:text-zinc-500">What shall we call you?</h2>
                <form onSubmit={handleCreate} className="relative">
                    <input 
                        type="text" 
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Enter your name..."
                        autoFocus
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white text-4xl md:text-5xl font-light text-center py-4 outline-none transition-colors placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                    />
                    
                    <div className="mt-12 flex items-center justify-center gap-6">
                        <button 
                            type="button"
                            onClick={() => setViewMode('list')}
                            className="px-6 py-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Cancel
                        </button>
                         <button 
                            type="submit"
                            disabled={!newSessionName.trim()}
                            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full text-lg font-medium tracking-wide disabled:opacity-50 hover:scale-105 transition-transform"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
      );
  }

  // --- LIST MODE ---
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-zinc-50 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-4">Who is learning?</h1>
          <p className="text-zinc-400 uppercase tracking-widest text-xs">Select a profile</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sessions.map(session => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <div
                  onClick={() => !editingId && onSelectSession(session.id)}
                  className={`
                    w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-6 rounded-2xl flex items-center justify-between transition-all duration-300 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 cursor-pointer
                    ${editingId === session.id ? 'ring-2 ring-black dark:ring-white' : ''}
                  `}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {session.avatar ? (
                          <img src={session.avatar} alt={session.name} className="w-full h-full object-cover" />
                      ) : (
                          <User size={20} className="text-zinc-500" />
                      )}
                    </div>
                    
                    {editingId === session.id ? (
                        <form onSubmit={saveEdit} className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                                ref={editInputRef}
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-full outline-none font-medium text-lg py-1"
                                onBlur={() => saveEdit()} // Auto save on blur? Or keep explicit? let's keep explicit buttons for clarity or enter
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                            />
                            <button type="submit" className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"><Check size={16}/></button>
                            <button type="button" onClick={cancelEdit} className="p-1 text-zinc-400 hover:text-red-500"><X size={16}/></button>
                        </form>
                    ) : (
                        <div className="text-left flex-1">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                                {session.name}
                            </h3>
                            <p className="text-xs text-zinc-400">Last active: {new Date(session.lastActive).toLocaleDateString()}</p>
                        </div>
                    )}
                  </div>

                  {!editingId && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                        <button
                            onClick={(e) => startEditing(session, e)}
                            className="p-2 text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                            title="Rename"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                            }}
                            className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                            title="Delete Session"
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
                        <ArrowRight size={20} className="text-zinc-300 dark:text-zinc-600" />
                      </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

            <motion.button
              layout
              onClick={() => setViewMode('create')}
              className="w-full py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <Plus size={20} />
              <span>New Profile</span>
            </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
