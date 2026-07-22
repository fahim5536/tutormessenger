import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, BookOpen, Calendar, Users, X } from "lucide-react";
import { User, ClassGroup, Message, Homework, ClassSchedule } from "../types";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  allUsers: User[];
  messages: Message[];
  homework: Homework[];
  schedules: ClassSchedule[];
  onSelectResult: (type: string, id: string) => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  classes,
  allUsers,
  messages,
  homework,
  schedules,
  onSelectResult
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
            // we should have a way to open it, but this component only handles the open state passed to it.
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  if (!isOpen) return null;

  const getResults = () => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: any[] = [];
    
    classes.filter(c => c.name.toLowerCase().includes(q)).forEach(c => {
      results.push({ type: 'class', id: c.id, icon: <Users className="w-4 h-4 text-blue-500" />, title: c.name, subtitle: 'Class Group' });
    });
    
    allUsers.filter(u => u.name.toLowerCase().includes(q)).forEach(u => {
      results.push({ type: 'user', id: u.id, icon: <Search className="w-4 h-4 text-gray-500" />, title: u.name, subtitle: 'User' });
    });

    homework.filter(h => h.title.toLowerCase().includes(q)).forEach(h => {
      results.push({ type: 'homework', id: h.id, icon: <BookOpen className="w-4 h-4 text-indigo-500" />, title: h.title, subtitle: 'Homework' });
    });

    return results.slice(0, 8);
  };

  const results = getResults();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search classes, users, or homework..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 placeholder-gray-400"
            />
            <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-400">ESC</div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === "" ? (
              <div className="p-8 text-center text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Start typing to search across the platform</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((r, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      onSelectResult(r.type, r.id);
                      onClose();
                    }}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
