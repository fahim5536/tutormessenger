import React, { useState } from "react";
import { Info, Users, Pin, FileText, ChevronDown, ChevronUp, MicOff, UserMinus, Plus, Shield, MessageSquare, ExternalLink } from "lucide-react";
import { ClassGroup, User, Message, Attachment } from "../types";

interface RightPanelProps {
  currentUser: User;
  classGroup?: ClassGroup;
  directChatUser?: User;
  chatMessages: Message[];
  allUsers: User[];
  onMuteStudent?: (studentId: string, mute: boolean) => void;
  onRemoveStudent?: (studentId: string) => void;
  onAddStudent?: (studentId: string) => void;
  onDirectMessage?: (userId: string) => void;
  onClose?: () => void;
}

export default function RightPanel({
  currentUser,
  classGroup,
  directChatUser,
  chatMessages,
  allUsers,
  onMuteStudent,
  onRemoveStudent,
  onAddStudent,
  onDirectMessage,
  onClose
}: RightPanelProps) {
  const [showMembers, setShowMembers] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const [addStudentId, setAddStudentId] = useState("");
  const [foundStudent, setFoundStudent] = useState<User | null>(null);
  const [searchError, setSearchError] = useState("");

  
  const handleSearchStudent = async () => {
    setSearchError("");
    setFoundStudent(null);
    if (!addStudentId.trim()) return;
    try {
      const response = await fetch(`/api/users/search/${addStudentId.trim()}`);
      const data = await response.json();
      if (response.ok) {
        setFoundStudent(data.user);
      } else {
        setSearchError(data.error || "Student not found");
      }
    } catch (err) {
      setSearchError("Failed to search");
    }
  };

  const isClassChat = !!classGroup;

  // Filter messages that contain attachments inside this chat
  const attachmentMessages = chatMessages.filter(m => m.attachments && m.attachments.length > 0);
  const pinnedMessages = chatMessages.filter(m => m.isPinned);

  // Get current class members info
  const members = isClassChat 
    ? allUsers.filter(u => classGroup.memberIds.includes(u.id))
    : [];

  const tutorInfo = isClassChat
    ? allUsers.find(u => u.id === classGroup.tutorId)
    : null;

  return (
    <div className="fixed inset-0 md:relative md:w-80 bg-white dark:bg-[#0a0e17] border-l border-slate-200 dark:border-white/5 h-full flex flex-col overflow-y-auto shrink-0 font-sans shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.5)] z-50 md:z-10 transition-colors pt-12 md:pt-0">
      
      {/* Top Banner Context Info */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
        {/* Subtle Background Accent */}
        {onClose && (
          <button onClick={onClose} className="md:hidden absolute top-4 left-4 p-2 text-slate-500 bg-slate-100 rounded-full z-20 cursor-pointer">
             <span className="sr-only">Close</span>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-blue-500/5 dark:from-blue-500/10 to-transparent pointer-events-none" />
        
        {isClassChat ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-display font-bold text-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase relative z-10">
              {classGroup.name.slice(0, 2)}
            </div>
            <div className="space-y-1 relative z-10">
              <h2 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight">{classGroup.name}</h2>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">{classGroup.subject} • {classGroup.level}</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">{classGroup.batch}</p>
            </div>
            {classGroup.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 rounded-xl font-medium leading-relaxed relative z-10 w-full shadow-inner">
                {classGroup.description}
              </p>
            )}
          </>
        ) : directChatUser ? (
          <>
            <div className="relative z-10">
              <img 
                src={directChatUser.avatarUrl} 
                alt="" 
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-[#0a0e17] bg-slate-100 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)]" 
              loading="lazy" />
              <span className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-[3px] border-white dark:border-[#0a0e17] ${
                directChatUser.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-600"
              }`} />
            </div>
            <div className="space-y-1.5 relative z-10">
              <h2 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight">{directChatUser.name}</h2>
              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest inline-block ${
                directChatUser.role === "tutor" 
                  ? "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" 
                  : "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
              }`}>
                {directChatUser.role === "tutor" ? "Verified Instructor" : "Student Space"}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">{directChatUser.email}</p>
            </div>
            {directChatUser.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 rounded-xl leading-relaxed relative z-10 w-full shadow-inner">
                {directChatUser.bio}
              </p>
            )}
          </>
        ) : (
          <div className="text-xs font-display font-bold text-slate-400 py-8 uppercase tracking-widest relative z-10">Select a workspace</div>
        )}
      </div>

      <div className="flex-1 divide-y divide-slate-100 dark:divide-white/5">
        
        {/* MEMBERS COLLAPSIBLE SECTION */}
        {isClassChat && (
          <div className="p-5">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="w-full flex items-center justify-between text-[10px] font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pb-3 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Class Members ({members.length + 1})</span>
              {showMembers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMembers && (
              <div className="space-y-3 pt-2">
                {/* Tutor Profile Block */}
                {tutorInfo && (
                  <div className="flex items-center justify-between bg-linear-to-r from-blue-50 to-transparent dark:from-blue-500/10 dark:to-transparent p-2.5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <img src={tutorInfo.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800 shadow-xs" loading="lazy" />
                      <div className="text-left">
                        <p className="text-sm font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none mb-1">
                          {tutorInfo.name} <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        </p>
                        <p className="text-[9px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest">Primary Instructor</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Students list */}
                {members.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-1 pl-1">No students have joined yet.</p>
                ) : (
                  members.map((stud) => {
                    const isMuted = classGroup.mutedStudentIds?.includes(stud.id);
                    return (
                      <div key={stud.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group/member">
                        <div className="flex items-center gap-3 text-left">
                          <div className="relative">
                            <img src={stud.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover bg-slate-100 dark:bg-slate-800" loading="lazy" />
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0a0e17] ${
                              stud.isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs font-display font-bold text-slate-900 dark:text-white leading-tight">{stud.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{stud.email}</p>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                          {currentUser.role === "tutor" && onMuteStudent && onRemoveStudent ? (
                            <>
                              <button
                                onClick={() => onMuteStudent(stud.id, !isMuted)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isMuted ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                }`}
                                title={isMuted ? "Unmute Student" : "Mute Student"}
                              >
                                <MicOff className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRemoveStudent(stud.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Remove student from group"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            // Students can trigger direct chat with other classmate or tutor
                            currentUser.id !== stud.id && onDirectMessage && (
                              <button
                                onClick={() => onDirectMessage(stud.id)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Direct Chat"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add Student UI for Tutor */}
                {currentUser.role === 'tutor' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 mt-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Add Student (6-Digit ID)</p>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text"
                        value={addStudentId}
                        onChange={(e) => { setAddStudentId(e.target.value); setSearchError(""); setFoundStudent(null); }}
                        placeholder="e.g. 123456"
                        className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-white/10 dark:bg-black/50 dark:text-white focus:outline-hidden focus:border-blue-500"
                      />
                      <button onClick={handleSearchStudent} className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 px-3 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer">
                        Search
                      </button>
                    </div>
                    {searchError && <p className="text-[10px] text-rose-500 font-medium mb-2">{searchError}</p>}
                    
                    {foundStudent && (
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-2">
                        <div className="flex flex-col gap-1 mb-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{foundStudent.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">ID: {foundStudent.studentId}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if (onAddStudent) onAddStudent(foundStudent.id);
                            setAddStudentId("");
                            setFoundStudent(null);
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          Confirm Add
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Add Student UI for Tutor */}
                {currentUser.role === 'tutor' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 mt-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Add Student (6-Digit ID)</p>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text"
                        value={addStudentId}
                        onChange={(e) => { setAddStudentId(e.target.value); setSearchError(""); setFoundStudent(null); }}
                        placeholder="e.g. 123456"
                        className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-white/10 dark:bg-black/50 dark:text-white focus:outline-hidden focus:border-blue-500"
                      />
                      <button onClick={handleSearchStudent} className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 px-3 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer">
                        Search
                      </button>
                    </div>
                    {searchError && <p className="text-[10px] text-rose-500 font-medium mb-2">{searchError}</p>}
                    
                    {foundStudent && (
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-2">
                        <div className="flex flex-col gap-1 mb-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{foundStudent.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">ID: {foundStudent.studentId}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if (onAddStudent) onAddStudent(foundStudent.id);
                            setAddStudentId("");
                            setFoundStudent(null);
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          Confirm Add
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PINNED MESSAGES SECTION */}
        <div className="p-5">
          <button
            onClick={() => setShowPins(!showPins)}
            className="w-full flex items-center justify-between text-[10px] font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pb-3 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2"><Pin className="w-4 h-4 text-blue-500" /> Pinned Notes ({pinnedMessages.length})</span>
            {showPins ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPins && (
            <div className="space-y-3 pt-2">
              {pinnedMessages.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-2 pl-1">No messages pinned in this conversation.</p>
              ) : (
                pinnedMessages.map((msg) => (
                  <div key={msg.id} className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-left space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-display font-bold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* SHARED ASSETS & FILES SECTION */}
        <div className="p-5">
          <button
            onClick={() => setShowFiles(!showFiles)}
            className="w-full flex items-center justify-between text-[10px] font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pb-3 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Shared Media & Files ({attachmentMessages.length})</span>
            {showFiles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFiles && (
            <div className="space-y-4 pt-2 pb-6">
              {attachmentMessages.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-2 pl-1">No files shared recently in this chat.</p>
              ) : (
                <>
                  {/* Media Grid */}
                  {attachmentMessages.some(m => m.attachments?.some(a => a.type === "image" || a.type === "video")) && (
                    <div className="grid grid-cols-3 gap-2">
                      {attachmentMessages.flatMap(msg => 
                        (msg.attachments || []).filter(att => att.type === "image" || att.type === "video").map(att => (
                          <a 
                            key={att.id} 
                            href={att.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square bg-slate-100 dark:bg-white/10 rounded-xl overflow-hidden relative group block shadow-sm border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                          >
                            {att.type === "image" ? (
                              <img src={att.url} alt={att.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                                <span className="text-[9px] font-bold">VIDEO</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ))
                      )}
                    </div>
                  )}

                  {/* Documents List */}
                  {attachmentMessages.some(m => m.attachments?.some(a => a.type !== "image" && a.type !== "video")) && (
                    <div className="space-y-2">
                      {attachmentMessages.flatMap(msg => 
                        (msg.attachments || []).filter(att => att.type !== "image" && att.type !== "video").map(att => (
                          <a
                            key={att.id}
                            href={att.url}
                            className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all text-left group shadow-sm"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2.5 bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-display font-bold text-slate-800 dark:text-slate-200 truncate max-w-44" title={att.name}>{att.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">Shared by {msg.senderName}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                          </a>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
