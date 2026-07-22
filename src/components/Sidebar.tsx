import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Users, BookOpen, Calendar, Folder, Shield, Search, Power, BellRing, Settings, Lock, Plus, MoreVertical, Trash2, BellOff, Ban, Home } from "lucide-react";
import { ClassGroup, User, Message } from "../types";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  currentUser: User;
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  classes: ClassGroup[];
  allUsers: User[];
  messages: Message[];
  typingUsers: Record<string, string[]>;
  activeTab: "dashboard" | "chat" | "homework" | "schedule" | "materials" | "admin" | "profile" | "teacher";
  setActiveTab: (tab: "dashboard" | "chat" | "homework" | "schedule" | "materials" | "admin" | "profile" | "teacher") => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateClass: () => void;
  onJoinClass: () => void;
  onAddContact: () => void;
}

export default function Sidebar({
  currentUser,
  activeChatId,
  onSelectChat,
  classes,
  allUsers,
  messages,
  typingUsers,
  activeTab,
  setActiveTab,
  onLogout,
  searchQuery,
  setSearchQuery,
  onCreateClass,
  onJoinClass,
  onAddContact
}: SidebarProps) {
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

  const [showMenu, setShowMenu] = React.useState(false);
  const [chatMenuId, setChatMenuId] = React.useState<string | null>(null);
  
  // Direct chats list (with all other users in database)
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

  // Filter lists based on search queries
  const filteredClasses = classes.filter(c => {
    if ((currentUser.hiddenChatIds || []).includes(c.id)) return false;
    if (searchQuery) return c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });
  const filteredUsers = otherUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Helper to count unread messages in a chat
  const getUnreadCount = (chatId: string) => {
    return messages.filter(m => m.chatId === chatId && m.senderId !== currentUser.id && (!m.readBy || !m.readBy.includes(currentUser.id))).length;
  };

  // Helper to get last message text and timestamp
  const getLastMessageInfo = (chatId: string) => {
    const chatMsgs = messages.filter(m => m.chatId === chatId);
    if (chatMsgs.length === 0) return { text: "No messages yet", time: "" };
    
    const last = chatMsgs[chatMsgs.length - 1];
    let text = last.content;
    if (!text && last.attachments && last.attachments.length > 0) {
      text = `📎 Attached ${last.attachments[0].type}`;
    }
    
    // format time beautifully (HH:MM or standard format)
    const d = new Date(last.timestamp);
    const isToday = d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    const time = isToday ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "Yesterday";
    return { text, time };
  };

  
return (
    <div className="w-full md:w-[400px] bg-white text-gray-900 h-full flex flex-col font-sans border-r border-gray-100 shrink-0 select-none shadow-[10px_0_40px_-15px_rgba(0,0,0,0.05)] z-20 border-r-0">
      
      {/* Top Banner */}
      <div className="pt-4 pb-3 px-6 flex items-center justify-between relative overflow-hidden">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900 leading-none">Messages</h1>
        <img src="/logo-small.png" alt="EduMessenger Logo" className="w-12 h-12 object-contain" loading="eager" />
      </div>

            {/* MAIN APP NAVIGATION TABS */}
      <div ref={scrollRef} className="hidden md:flex px-6 pb-4 overflow-x-auto custom-scrollbar" style={{ whiteSpace: "nowrap", WebkitOverflowScrolling: "touch" }}>
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
        </div>
      </div>
      {/* SEARCH CONVERSATIONS */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="w-[18px] h-[18px] text-gray-400 absolute left-4 top-2.5" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[15px] py-2.5 pl-11 pr-4 rounded-full bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-500 font-medium"
          />
        </div>
      </div>

      {/* SCROLLABLE CONVERSATIONS LIST */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pb-32 custom-scrollbar">
        {activeTab !== "chat" ? (
          <div className="p-6 text-center text-sm text-gray-500">
             Open main workspace.
          </div>
        ) : (
          <>
            {/* Direct Users List */}

            {allUsers.length === 0 && (
              <div className="px-6 py-4 space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-[52px] w-[52px] rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredUsers.map((user) => {
              const directId = `${currentUser.id}_${user.id}`;
              const altDirectId = `${user.id}_${currentUser.id}`;
              const actualDirectId = messages.some(m => m.chatId === directId) ? directId :
                                      messages.some(m => m.chatId === altDirectId) ? altDirectId :
                                      directId;
              const isActive = activeChatId === actualDirectId;
              const unread = getUnreadCount(actualDirectId);
              const lastMsg = getLastMessageInfo(actualDirectId);
              const isTyping = (typingUsers[actualDirectId] || []).includes(user.id);

              
return (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectChat(actualDirectId)}
                  className={`w-full text-left py-3 px-6 flex items-center gap-4 transition-colors cursor-pointer ${
                    isActive ? "bg-gray-50" : "hover:bg-gray-50/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={user.avatarUrl} alt="" className="w-[52px] h-[52px] rounded-full object-cover bg-gray-100" loading="lazy" />
                    <span className={`absolute bottom-0.5 right-0.5 block h-3 w-3 rounded-full border-2 border-white ${
                      user.isOnline ? "bg-green-500" : "bg-slate-300"
                    }`} title={user.isOnline ? "Online" : "Offline"} />
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-[15px] truncate leading-none ${unread > 0 ? "font-bold text-black" : "font-semibold text-gray-900"}`}>
                          {user.name}
                        </p>
                        {!user.isOnline && (!user.lastActiveAt || (new Date().getTime() - new Date(user.lastActiveAt).getTime()) > 10 * 60 * 1000) && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded leading-none shrink-0 font-medium border border-slate-200">Offline</span>
                        )}
                      </div>
                      <span className={`text-[13px] shrink-0 ${unread > 0 ? "text-black font-semibold" : "text-gray-400 font-medium"}`}>
                        {lastMsg.time}
                      </span>
                    </div>
                    {isTyping ? (
                      <p className="text-[14px] text-gray-400 font-medium animate-pulse">Typing...</p>
                    ) : (
                      <p className={`text-[14px] truncate ${unread > 0 ? "text-black font-medium" : "text-gray-500"}`}>
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                  
                  {unread > 0 && (
                    <div className="shrink-0 flex items-center justify-center pl-2">
                      <span className="bg-black text-[11px] font-bold text-white h-[22px] min-w-[22px] px-1.5 rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}

            {/* Class Groups List */}
            {filteredClasses.length > 0 && <div className="mt-4 mb-2 px-6 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Classes</div>}
            {filteredClasses.map((cls) => {
              const isActive = activeChatId === cls.id;
              const unread = getUnreadCount(cls.id);
              const lastMsg = getLastMessageInfo(cls.id);
              const typing = typingUsers[cls.id] || [];

              
return (
                <motion.button
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectChat(cls.id)}
                  className={`w-full text-left py-3 px-6 flex items-center gap-4 transition-colors cursor-pointer ${
                    isActive ? "bg-gray-50" : "hover:bg-gray-50/50"
                  }`}
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-100 text-gray-600 font-bold text-[18px] flex items-center justify-center uppercase shrink-0">
                    {cls.name.slice(0, 1)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className={`text-[15px] truncate leading-none ${unread > 0 ? "font-bold text-black" : "font-semibold text-gray-900"}`}>
                        {cls.name}
                      </p>
                      <span className={`text-[13px] shrink-0 ${unread > 0 ? "text-black font-semibold" : "text-gray-400 font-medium"}`}>
                        {lastMsg.time}
                      </span>
                    </div>
                    {typing.length > 0 ? (
                      <p className="text-[14px] text-gray-400 font-medium animate-pulse">Someone is typing...</p>
                    ) : (
                      <p className={`text-[14px] truncate ${unread > 0 ? "text-black font-medium" : "text-gray-500"}`}>
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                  
                  {unread > 0 && (
                    <div className="shrink-0 flex items-center justify-center pl-2">
                      <span className="bg-black text-[11px] font-bold text-white h-[22px] min-w-[22px] px-1.5 rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </>
        )}
      </div>
      {/* BOTTOM SETTINGS AREA */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between z-10 bg-white">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-black shadow-sm text-white font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'
          }`}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </button>
      </div>


      {/* Floating Bottom Nav & FAB Container */}
      <div className="absolute bottom-[80px] left-0 w-full px-6 flex flex-col gap-4 pointer-events-none z-50">
        
        {/* Floating Action Button & Menu */}
        <div className="flex justify-end relative pointer-events-auto">
          {showMenu && (
            <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-48 overflow-hidden z-50">
              <button onClick={() => { setShowMenu(false); onAddContact(); }} className="w-full text-left px-5 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" /> Contact
              </button>
              <button onClick={() => { setShowMenu(false); onCreateClass(); }} className="w-full text-left px-5 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" /> Create Group
              </button>
              <button onClick={() => { setShowMenu(false); onJoinClass(); }} className="w-full text-left px-5 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3">
                <Plus className="w-5 h-5 text-gray-500" /> Join via Code
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="w-[52px] h-[52px] rounded-full bg-black text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform"
          >
            <span className="text-[28px] font-light leading-none mb-1">+</span>
          </button>
        </div>


</div>
    </div>
  );
}
