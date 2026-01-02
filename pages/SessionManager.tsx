import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, ArrowRight, Pencil, X, Check } from 'lucide-react';
import { BotIcon } from '../components/ui/bot';
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
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-zinc-50 transition-colors">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full max-w-lg text-center"
            >
                <h2 className="text-2xl font-light mb-8 text-zinc-500">What shall we call you?</h2>
                <form onSubmit={handleCreate} className="relative">
                    <input 
                        type="text" 
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Enter your name..."
                        autoFocus
                        className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-white text-4xl md:text-5xl font-light text-center py-4 outline-none transition-colors placeholder:text-zinc-800"
                    />
                    
                    <div className="mt-12 flex items-center justify-center gap-6">
                        <button 
                            type="button"
                            onClick={() => setViewMode('list')}
                            className="px-6 py-3 text-zinc-400 hover:text-zinc-300 transition-colors"
                        >
                            Cancel
                        </button>
                         <button 
                            type="submit"
                            disabled={!newSessionName.trim()}
                            className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium tracking-wide disabled:opacity-50 hover:scale-105 transition-transform"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-zinc-50 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-4">Who is learning?</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs">Select a profile</p>
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
                    w-full bg-zinc-800 hover:bg-zinc-700/80 p-6 rounded-2xl flex items-center justify-between transition-all duration-300 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer shadow-sm
                    ${editingId === session.id ? 'ring-2 ring-white' : ''}
                  `}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {session.avatar ? (
                          <img src={session.avatar} alt={session.name} className="w-full h-full object-cover" />
                      ) : (
                          <BotIcon size={20} className="text-zinc-400" />
                      )}
                    </div>
                    
                    {editingId === session.id ? (
                        <form onSubmit={saveEdit} className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                                ref={editInputRef}
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-transparent border-b border-zinc-700 w-full outline-none font-medium text-lg py-1"
                                onBlur={() => saveEdit()} // Auto save on blur? Or keep explicit? let's keep explicit buttons for clarity or enter
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                            />
                            <button type="submit" className="p-1 text-green-500 hover:bg-green-900/30 rounded"><Check size={16}/></button>
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
                            className="p-2 text-zinc-300 hover:text-white transition-colors"
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
                        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                        <ArrowRight size={20} className="text-zinc-600" />
                      </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

            {sessions.length < 4 && (
                <motion.button
                layout
                onClick={() => setViewMode('create')}
                className="w-full py-6 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
                >
                <Plus size={20} />
                <span>New Profile</span>
                </motion.button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
