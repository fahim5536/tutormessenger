import React, { useRef, useEffect } from "react";
import { MessageSquare, BookOpen, Calendar, Folder, Shield, Settings, Home } from "lucide-react";
import { User } from "../types";

interface MobileTabRowProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentUser: User;
}

export default function MobileTabRow({ activeTab, setActiveTab, currentUser }: MobileTabRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
            const onWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY * 1.5, behavior: 'smooth' });
        }
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);

  return (
    <div ref={scrollRef} className="md:hidden w-full bg-white border-t border-gray-100 px-4 pt-3 pb-5 overflow-x-auto custom-scrollbar shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]" style={{ display: "flex", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch" }}>
      <div className="flex gap-2 min-w-max">
        <button 
          onClick={() => setActiveTab("dashboard")} 
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'dashboard' ? 'bg-black text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Home className="w-4 h-4" /> Home
        </button>
        <button 
          onClick={() => setActiveTab("chat")} 
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'chat' ? 'bg-black text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Chats
        </button>
        
        {currentUser.role === "tutor" && (
          <button 
            onClick={() => setActiveTab("teacher")} 
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Shield className="w-4 h-4" /> Teacher Dashboard
          </button>
        )}

        <button 
          onClick={() => setActiveTab("homework")} 
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'homework' ? 'bg-black text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Homework
        </button>

        <button 
          onClick={() => setActiveTab("schedule")} 
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'schedule' ? 'bg-black text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Schedule
        </button>
        
        <button 
          onClick={() => setActiveTab("materials")} 
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'materials' ? 'bg-black text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Folder className="w-4 h-4" /> Shared Study
        </button>

        <button 
          onClick={() => setActiveTab("profile")} 
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'profile' ? 'bg-black text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>
    </div>
  );
}
