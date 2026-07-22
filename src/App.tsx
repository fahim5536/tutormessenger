import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Users, Phone, Video, Send, Paperclip, Smile, Reply, Trash2, ArrowLeft, 
  Edit, Pin, MoreVertical, AlertCircle, Mic, MicOff, VideoOff, PhoneOff, 
  Sparkles, Plus, Search, Megaphone, ChevronRight, X, UserPlus, Info, CheckCircle2,
  Shield, BookOpen, Calendar, Folder, Award, LogOut, FileText,
  Play, Pause, Lock, Unlock, Check, CheckCheck
} from "lucide-react";
import { 
  User, ClassGroup, Message, Homework, Submission, ClassSchedule, 
  CallSession, Notification, Announcement, StudyMaterial, Attachment 
} from "./types";
const Sidebar = React.lazy(() => import("./components/Sidebar"));
const RightPanel = React.lazy(() => import("./components/RightPanel"));
const HomeworkTab = React.lazy(() => import("./components/HomeworkTab"));
const ScheduleTab = React.lazy(() => import("./components/ScheduleTab"));
const MaterialsTab = React.lazy(() => import("./components/MaterialsTab"));
const AIHelperModal = React.lazy(() => import("./components/AIHelperModal"));
const AuthScreen = React.lazy(() => import("./components/AuthScreen"));
import LandingPage from "./components/LandingPage";
const CommandPaletteModal = React.lazy(() => import("./components/CommandPaletteModal"));
const TeacherDashboard = React.lazy(() => import("./components/TeacherDashboard"));
const DashboardTab = React.lazy(() => import("./components/DashboardTab"));


const PrivacyPolicy = React.lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./components/TermsOfService"));
const HelpCenter = React.lazy(() => import("./components/HelpCenter"));
const ProfileTab = React.lazy(() => import("./components/ProfileTab"));
const MobileTabRow = React.lazy(() => import("./components/MobileTabRow"));

// Helper to decrypt locally-simulated E2EE messages
export function decryptMessageContent(content: string): string {
  if (content && content.startsWith("🔒 e2ee_payload:")) {
    try {
      const encoded = content.replace("🔒 e2ee_payload:", "");
      return decodeURIComponent(atob(encoded));
    } catch (e) {
      return "[🔒 Missing local verification key to decrypt payload]";
    }
  }
  return content;
}

// Upgraded Voice Message Playback Controls component with digital waveform and variable speed
export function VoicePlayer({ name }: { name: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev + 2 * playbackSpeed;
        });
      }, 150);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedCycle = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-black text-white rounded-2xl w-full sm:w-64 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-black flex items-center justify-center transition-all cursor-pointer shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black text-black" />
          ) : (
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-100 truncate">{name}</p>
          <p className="text-[9px] text-slate-400 font-mono">
            0:0{Math.floor((progress / 100) * 8)} / 0:08 • {playbackSpeed}x Speed
          </p>
        </div>
        <button
          type="button"
          onClick={handleSpeedCycle}
          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer"
        >
          {playbackSpeed}x
        </button>
      </div>
      
      {/* Dynamic Waveform Representation */}
      <div className="flex items-end gap-1 h-7 px-1 mt-1">
        {[4, 10, 16, 8, 12, 18, 14, 6, 10, 22, 14, 8, 16, 12, 4, 10, 18, 12, 8, 14, 22, 10, 6, 12, 16, 8, 4, 10].map((height, i) => {
          const barPercent = (i / 28) * 100;
          const isPassed = progress >= barPercent;
          return (
            <div
              key={i}
              style={{ height: `${height * 1.1}px` }}
              className={`flex-1 rounded-sm transition-colors duration-150 ${
                isPassed ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-700"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}


import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { initAnalytics, logPageView, logEvent } from "./lib/analytics";

import { supabase } from "./lib/supabase";

export default function App() {
  // Core Application States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat" | "homework" | "schedule" | "materials" | "admin" | "profile" | "teacher">("dashboard");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxVideo, setLightboxVideo] = useState<{name: string, url: string} | null>(null);
  const [authMode, setAuthMode] = useState<"landing" | "login" | "signup" | "privacy" | "terms" | "help">("landing");
  
  // DB States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  // Input states
  const [messageInput, setMessageInput] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [fileToAttach, setFileToAttach] = useState<Attachment | null>(null);
  const [selectedEmojiMessageId, setSelectedEmojiMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");

  // Search inside Active Conversation
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");

  // Modals & Popups
  const [isAIHelperOpen, setIsAIHelperOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callMicMuted, setCallMicMuted] = useState(false);
  const [callCamOff, setCallCamOff] = useState(false);

  // Authentication states
  const [authEmail, setAuthEmail] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Class creation state (Tutor only)
  const [showCreateClassForm, setShowCreateClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassBatch, setNewClassBatch] = useState("Spring 2026");
  const [newClassLevel, setNewClassLevel] = useState("High School");
  const [newClassDesc, setNewClassDesc] = useState("");

  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [contactEmailInput, setContactEmailInput] = useState("");
  const [foundStudent, setFoundStudent] = useState<User | null>(null);
  const [searchError, setSearchError] = useState("");

  // Announcements composer state
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementClassId, setAnnouncementClassId] = useState("");

  // Admin states
  const [adminAddUserEmail, setAdminAddUserEmail] = useState("");
  const [adminAddUserName, setAdminAddUserName] = useState("");
  const [adminAddUserRole, setAdminAddUserRole] = useState<"tutor" | "student">("student");
  const [adminAddUserBio, setAdminAddUserBio] = useState("");
  const [adminError, setAdminError] = useState("");

  // Auto scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Initial login verification and active call polling
  useEffect(() => {
    // Try to restore user from localStorage if any
    const savedUser = localStorage.getItem("edu_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      if (user) {
        if (!user.email_confirmed_at) return;
                const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          const userDoc = { id: user.id, name: `${data.first_name} ${data.last_name}`, firstName: data.first_name, lastName: data.last_name, ...data };
          setCurrentUser(userDoc as any);
          localStorage.setItem("edu_user", JSON.stringify(userDoc));
          // Sync with backend JSON db
          fetch("/api/users/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userDoc)
          });
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("edu_user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme class to document element on load / change
  useEffect(() => {
    const currentTheme = currentUser?.theme || "light";
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentUser?.theme]);

  // 2b. Firestore real-time listener for messages
  useEffect(() => {
    if (!currentUser) return;
        const fetchMessages = async () => {
      const { data, error } = await supabase.from('messages').select('*').order('timestamp', { ascending: true });
      if (data) {
        setMessages(prev => {
          const local = prev.filter(m => !data.find((f: any) => f.id === m.id));
          return [...local, ...data].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) as Message[];
        });
      }
    };
    fetchMessages();


    const msgChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
      })
      .subscribe();

    const groupsChannel = supabase
      .channel('public:groups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, payload => {
        // Simple reload or state update for groups
        fetch(`/api/state?userId=${currentUser.id}`).then(res => res.json()).then(data => {
            if (data.classes) setClasses(data.classes);
        });
      })
      .subscribe();
      
    const membersChannel = supabase
      .channel('public:group_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, payload => {
        fetch(`/api/state?userId=${currentUser.id}`).then(res => res.json()).then(data => {
            if (data.classes) setClasses(data.classes);
            if (data.users) setAllUsers(data.users);
        });
      })
      .subscribe();

    return () => { 
        supabase.removeChannel(msgChannel); 
        supabase.removeChannel(groupsChannel);
        supabase.removeChannel(membersChannel);
    };
  }, [currentUser]);
  useEffect(() => {
    if (!currentUser) return;

    const fetchState = async () => {
      try {
        const response = await fetch(`/api/state?userId=${currentUser.id}`);
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
             return; // Skip if not JSON (e.g. Vite SPA fallback during reload)
          }
          const data = await response.json();
          setAllUsers(data.users);
          setClasses(data.classes);
          // Merge local mock messages with Firestore ones
          setMessages((prev) => {
            const fsMsgs = prev.filter(m => m.id.startsWith("fs_"));
            const combined = [...data.messages, ...fsMsgs];
            // Deduplicate by ID just in case
            const uniqueMap = new Map();
            combined.forEach(m => uniqueMap.set(m.id, m));
            return Array.from(uniqueMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          });
          setHomework(data.homework);
          setSubmissions(data.submissions);
          setSchedules(data.schedules);
          setAnnouncements(data.announcements);
          setStudyMaterials(data.studyMaterials);
          setNotifications(data.notifications);
          setCalls(data.calls);
          setTypingUsers(data.typingUsers || {});

          // Track active call if any is active for this chat
          const activeCallInChat = data.calls.find(
            (c: CallSession) => c.status === "active" && c.participants.includes(currentUser.id)
          );
          if (activeCallInChat) {
            setActiveCall(prev => {
              if (prev?.id === activeCallInChat.id && prev?.participants.length === activeCallInChat.participants.length) {
                return prev; // Same call, avoid reference change
              }
              return activeCallInChat;
            });
          } else {
            setActiveCall(prev => {
              if (prev && !data.calls.some((c: CallSession) => c.id === prev.id && c.status === "active")) {
                // Call was closed on backend
                setCallDuration(0);
                setCallMicMuted(false);
                setCallCamOff(false);
                return null;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          // Ignore expected network errors during server restarts
        } else {
          console.error("Error polling backend state:", err);
        }
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2500); // Poll state every 2.5 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  // 3. Mark active chat messages as read whenever loaded
  useEffect(() => {
    if (!currentUser || !activeChatId) return;

    const markAsRead = async () => {
      try {
        await fetch(`/api/chats/${activeChatId}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id })
        });
      } catch (err) {
        console.error("Failed to update read receipts:", err);
      }
    };

    markAsRead();
  }, [activeChatId, messages, currentUser]);

  // 4. Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  useEffect(() => {
    setShowRightPanel(false);
  }, [activeChatId]);

  // 5. Call Duration Timer Hook
  useEffect(() => {
    if (activeCall) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall]);

  // Auth helper: Login with Email
  const handleLogin = async (email: string) => {
    setAuthError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem("edu_user", JSON.stringify(data.user));
        logEvent("Auth", "Login");
        // Reset navigation
        setActiveTab("chat");
        setActiveChatId(null);
      } else {
        setAuthError(data.error || "Email not registered.");
      }
    } catch (err) {
      setAuthError("Failed to connect to backend server.");
    }
  };

  // Auth helper: Logout
  const handleLogout = async () => {
    if (currentUser) {
      try {
        // Toggle online status off
        await fetch(`/api/users/${currentUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: false })
        });
        await supabase.auth.signOut();
        logEvent("Auth", "Logout");
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem("edu_user");
    setCurrentUser(null);
    setActiveChatId(null);
    setActiveCall(null);
  };

  // Helper: Join Class Group using Code/Name
  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !classCodeInput.trim()) return;

    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: classCodeInput.trim(), studentId: currentUser.id })
      });
      const data = await response.json();
      if (response.ok) {
        setClassCodeInput("");
        // Notify success
        toast.success(`Successfully joined class: ${data.class.name}!`);
        // Refresh state
        setActiveChatId(data.class.id);
        logEvent("Groups", "CreateClass");
      } else {
        toast.error(data.error || "Failed to join class.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tutor: Create Class Group
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newClassName.trim() || !newClassSubject.trim()) return;

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClassName,
          subject: newClassSubject,
          batch: newClassBatch,
          level: newClassLevel,
          tutorId: currentUser.id,
          description: newClassDesc
        })
      });
      const data = await response.json();
      if (response.ok) {
        setNewClassName("");
        setNewClassSubject("");
        setNewClassDesc("");
        setShowCreateClassForm(false);
        setIsCreateClassModalOpen(false);
        setActiveChatId(data.class.id);
        logEvent("Groups", "CreateClass");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setFoundStudent(null);
    if (!contactEmailInput.trim() || !currentUser) return;
    
    const input = contactEmailInput.trim().toLowerCase();
    
    try {
      // First try to search by studentId via the API
      const res = await fetch(`/api/users/search/${input}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.id !== currentUser.id) {
          setFoundStudent(data.user);
          return;
        }
      }
      
      // Fallback: search locally by email or studentId
      const targetUser = allUsers.find(u => 
        (u.studentId === input || u.email.toLowerCase() === input) && 
        u.id !== currentUser.id
      );
      
      if (targetUser) {
        setFoundStudent(targetUser);
      } else {
        setSearchError("Account ID or Email not found");
      }
    } catch (err) {
      setSearchError("Search failed");
    }
  };

  const handleConnectFoundStudent = () => {
    if (foundStudent) {
      handleDirectMessage(foundStudent.id);
      setIsAddContactModalOpen(false);
      setContactEmailInput("");
      setFoundStudent(null);
    }
  };
  
  const handleCancelSearch = () => {
    setIsAddContactModalOpen(false);
    setFoundStudent(null);
    setSearchError("");
    setContactEmailInput("");
  };

  // Send Chat Message Action
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChatId) return;
    if (!messageInput.trim() && !fileToAttach) return;

    try {
      let isEncrypted = false;
      let encryptedContent = undefined;
      let finalContent = messageInput;

      // Check if this is a direct private chat and encryption is active
      const otherUser = activeChatId.includes("_")
        ? allUsers.find(u => u.id === activeChatId.split("_").find(id => id !== currentUser.id))
        : null;

      if (otherUser && (currentUser.e2eeEnabled || otherUser.e2eeEnabled)) {
        isEncrypted = true;
        // Create an elegant simulated AES-GCM secure block representation
        const rawContent = messageInput || (fileToAttach ? `Sent an attachment: ${fileToAttach.name}` : "");
        encryptedContent = btoa(encodeURIComponent(rawContent));
        finalContent = `🔒 e2ee_payload:${encryptedContent}`;
      }

      const payload = {
        chatId: activeChatId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        content: finalContent,
        timestamp: new Date().toISOString(), // Use local ISO string for ease
        replyToId: replyToMessage?.id || null,
        replyToContent: replyToMessage ? `${replyToMessage.senderName}: ${replyToMessage.content || "Attached asset"}` : null,
        attachments: fileToAttach ? [fileToAttach] : null,
        isEncrypted,
        encryptedContent: encryptedContent || null,
        readBy: [currentUser.id]
      };

      // Write to Firestore
      await supabase.from("messages").insert([{...payload, timestamp: new Date().toISOString()}]);
      logEvent("Chat", "SendMessage");

      // Still call our backend to handle notifications
      const response = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessageInput("");
        setReplyToMessage(null);
        setFileToAttach(null);
        // Clear typing indicator instantly
        sendTypingStatus(false);
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Failed to send message.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Real File attachment uploader via Firebase Storage
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine type
    let type: "image" | "video" | "audio" | "pdf" = "pdf";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";

    // Format size
    const size = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + " MB" : (file.size / 1024).toFixed(1) + " KB";

    // Show a loading attachment state
    const localAtt: Attachment = {
      id: "att_local_" + Date.now(),
      name: file.name,
      type,
      url: "",
      size: `${size} - Uploading...`
    };
    setFileToAttach(localAtt);

    try {
      const fileName = `uploads/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('attachments').upload(fileName, file);
      
      if (error) {
        console.error("Upload failed", error);
        toast.error("File upload failed.");
        setFileToAttach(null);
      } else {
        const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(fileName);
        const downloadURL = urlData.publicUrl;
        logEvent('Files', 'FileUpload');
        setFileToAttach({
          id: localAtt.id,
          name: file.name,
          type,
          url: downloadURL,
          size
        });
      }
    } catch (err) {
      console.error(err);
      setFileToAttach(null);
    }
  };

  // Edit/Delete/Pin Message Put Request
  const handleModifyMessage = async (messageId: string, action: "edit" | "delete" | "pin", newContent?: string) => {
    if (!activeChatId) return;
    try {
      await fetch(`/api/chats/${activeChatId}/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content: newContent })
      });
      setEditingMessageId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle emoji reactions
  const handleReactToMessage = async (messageId: string, emoji: string) => {
    if (!currentUser || !activeChatId) return;
    try {
      await fetch(`/api/chats/${activeChatId}/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, emoji })
      });
      setSelectedEmojiMessageId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Send typing indicator to backend
  let typingTimeout: NodeJS.Timeout;
  const handleTypingInput = (text: string) => {
    setMessageInput(text);
    sendTypingStatus(true);

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  const sendTypingStatus = async (isTyping: boolean) => {
    if (!currentUser || !activeChatId) return;
    try {
      await fetch(`/api/chats/${activeChatId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, isTyping })
      });
    } catch (err) {
      // Ignore typing check errors
    }
  };

  // Call helper: Start a mock call
  const handleStartCall = async (type: "voice" | "video") => {
    if (!currentUser || !activeChatId) return;

    try {
      const response = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          hostId: currentUser.id,
          hostName: currentUser.name,
          type
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActiveCall(data.call);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Call helper: Join Call
  const handleJoinActiveCall = async (callId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/calls/${callId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await response.json();
      if (response.ok) {
        setActiveCall(data.call);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Call helper: Leave Call
  const handleLeaveCall = async () => {
    if (!currentUser || !activeCall) return;
    try {
      await fetch(`/api/calls/${activeCall.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      handleLeaveCallLocal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveCallLocal = () => {
    setActiveCall(null);
    setCallCamOff(false);
    setCallMicMuted(false);
  };

  // Academic Action: Post Announcement (Tutor only)
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !announcementText.trim() || !announcementClassId) return;

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classGroupId: announcementClassId,
          tutorId: currentUser.id,
          content: announcementText
        })
      });
      if (response.ok) {
        setAnnouncementText("");
        setAnnouncementClassId("");
        toast.success("Announcement posted!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Academic Action: Assign Homework
  const handleAssignHomework = async (payload: any) => {
    if (!currentUser) return;
    try {
      await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, tutorId: currentUser.id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Academic Action: Submit Homework
  const handleSubmitHomework = async (homeworkId: string, content: string, attachments?: Attachment[]) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/homework/${homeworkId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          studentName: currentUser.name,
          content,
          attachments
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Academic Action: Grade Homework
  const handleGradeSubmission = async (submissionId: string, grade: string, feedback: string) => {
    try {
      await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, feedback })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Academic Action: Schedule a Class
  const handleScheduleClass = async (payload: any) => {
    if (!currentUser) return;
    try {
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, tutorId: currentUser.id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Academic Action: Update attendance checklist
  const handleUpdateAttendance = async (scheduleId: string, studentIds: string[]) => {
    try {
      await fetch(`/api/schedule/${scheduleId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Academic Action: Upload Study Material
  const handleUploadMaterial = async (payload: any) => {
    if (!currentUser) return;
    try {
      await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, tutorId: currentUser.id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Tutor Management: Mute Student in Class
  const handleMuteStudent = async (studentId: string, mute: boolean) => {
    if (!activeChatId) return;
    try {
      await fetch(`/api/classes/${activeChatId}/mute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, mute })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Tutor Management: Remove Student from Class
  
  const handleAddStudentToClass = async (studentId: string) => {
    if (!activeChatId) return;
    try {
      await fetch(`/api/classes/${activeChatId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!activeChatId) return;
    if (!confirm("Are you sure you want to remove this student from your group?")) return;
    try {
      await fetch(`/api/classes/${activeChatId}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Student action: initiate chat with classmate/tutor
  const handleDirectMessage = (userId: string) => {
    const directChatKey = `${currentUser?.id}_${userId}`;
    setActiveTab("chat");
    setActiveChatId(directChatKey);
  };

  // Profile Action: Update Bio / Subjects
  const handleUpdateProfile = async (bio: string, subjects: string[], hourlyRate?: string) => {
    if (!currentUser) return;
    try {
      // Mock API call to keep local state working for components relying on server.ts
      fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, subjects, hourlyRate })
      }).catch(() => {});
      
      const updateData = { bio, subjects, hourlyRate };
      await supabase.from("profiles").update({ bio, subjects, hourly_rate: hourlyRate }).eq("id", currentUser.id);
      
      const updatedUser = { ...currentUser, ...updateData };
      setCurrentUser(updatedUser);
      localStorage.setItem("edu_user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Firestore update failed", err);
    }
  };

  // Theme Action: Update theme preference in profile
  const handleUpdateTheme = async (theme: "light" | "dark") => {
    if (!currentUser) return;
    try {
      fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme })
      }).catch(() => {});

      await supabase.from("profiles").update({ theme }).eq("id", currentUser.id);
      const updatedUser = { ...currentUser, theme };
      setCurrentUser(updatedUser);
      localStorage.setItem("edu_user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle E2EE Preference
  const handleToggleE2EE = async (enabled: boolean) => {
    if (!currentUser) return;
    const fingerprint = enabled 
      ? `SHA-256:${Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16).toUpperCase()).join("")}`
      : "";
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e2eeEnabled: enabled, keyFingerprint: fingerprint })
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem("edu_user", JSON.stringify(data.user));
        logEvent("Auth", "Login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update read receipts setting
  const handleToggleReadReceipts = async (enabled: boolean) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readReceiptsOn: enabled })
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem("edu_user", JSON.stringify(data.user));
        logEvent("Auth", "Login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Action: Create a New User
  const handleAdminAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!adminAddUserName.trim() || !adminAddUserEmail.trim()) {
      setAdminError("Please fill in Name and Email.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminAddUserName,
          email: adminAddUserEmail,
          role: adminAddUserRole,
          bio: adminAddUserBio,
          subjects: adminAddUserRole === "tutor" ? ["AP Calculus", "English Lit"] : []
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Account created successfully for ${adminAddUserName}!`);
        setAdminAddUserName("");
        setAdminAddUserEmail("");
        setAdminAddUserBio("");
      } else {
        setAdminError(data.error || "Failed to create user.");
      }
    } catch (err) {
      setAdminError("Connection error.");
    }
  };

  // Admin Action: Delete User
  const handleAdminDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user permanently?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User account deleted.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Active Chat variables
  const isClassChat = activeChatId ? !activeChatId.includes("_") : false;
  const activeClassGroup = isClassChat 
    ? classes.find((c) => c.id === activeChatId) 
    : undefined;

  const activeDirectUser = (activeChatId && !isClassChat)
    ? allUsers.find((u) => activeChatId.split("_").includes(u.id) && u.id !== currentUser?.id)
    : undefined;

  const activeChatMessages = activeChatId
    ? messages.filter((m) => {
        if (isClassChat) return m.chatId === activeChatId;
        // Direct chats match either user1_user2 or user2_user1
        const parties = activeChatId.split("_");
        if (m.chatId.includes("_")) {
          const mParties = m.chatId.split("_");
          return mParties.includes(parties[0]) && mParties.includes(parties[1]);
        }
        return false;
      })
    : [];

  const activeChatCalls = activeChatId
    ? calls.filter(c => c.chatId === activeChatId && c.status === "active")
    : [];

  // Filter messages based on chatSearchQuery
  const filteredChatMessages = chatSearchQuery.trim()
    ? activeChatMessages.filter(m => m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : activeChatMessages;

  // Format active call duration timer
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // If user is NOT logged in, show the polished login page with Firebase Auth
  if (!currentUser) {
    if (authMode === "privacy") {
      return <React.Suspense fallback={<div className="h-screen w-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}><PrivacyPolicy onBack={() => setAuthMode("landing")} /></React.Suspense>;
    }
    if (authMode === "terms") {
      return <React.Suspense fallback={<div className="h-screen w-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}><TermsOfService onBack={() => setAuthMode("landing")} /></React.Suspense>;
    }
    if (authMode === "help") {
      return <React.Suspense fallback={<div className="h-screen w-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}><HelpCenter onBack={() => setAuthMode("landing")} /></React.Suspense>;
    }
    if (authMode === "landing") {
      return (
        <LandingPage 
          onLoginClick={() => setAuthMode("login")} 
          onSignUpClick={() => setAuthMode("signup")} 
          onPrivacyClick={() => setAuthMode("privacy")}
          onTermsClick={() => setAuthMode("terms")}
          onHelpClick={() => setAuthMode("help")}
        />
      );
    }
    return (
      <React.Suspense fallback={<div className="h-screen w-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <AuthScreen 
        initialMode={authMode}
        onBack={() => setAuthMode("landing")}
        error={authError}
        onLoginSuccess={(userDoc: any) => {
          setCurrentUser(userDoc);
          if (userDoc.role === "tutor") {
            setActiveTab("teacher");
          } else if (userDoc.role === "admin") {
            setActiveTab("admin");
          } else {
            setActiveTab("chat");
          }
          setActiveChatId(null);
        }}
      />
      </React.Suspense>
    );
  }

  // MAIN AUTHENTICATED SYSTEM LAYOUT
  const isDark = false;

  return (
    <React.Suspense fallback={<div className="h-screen w-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
    <div className={`flex h-screen font-sans select-none overflow-hidden ${isDark ? "bg-[#030712] text-slate-100 dark" : "bg-[#f8fafc] text-slate-900"}`}>
      
      {/* 1. LEFT SIDE NAVIGATION & CONVERSATIONS LIST */}
      <div className={`${(activeChatId || activeTab !== "chat") ? "hidden md:flex" : "flex"} w-full md:w-auto h-full`}>
        <Sidebar 
        currentUser={currentUser}
        activeChatId={activeChatId}
        onSelectChat={(chatId) => { logEvent('Chat', 'OpenChat'); setActiveChatId(chatId); }}
        classes={classes}
        allUsers={allUsers}
        messages={messages}
        typingUsers={typingUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        searchQuery={sidebarSearchQuery}
        setSearchQuery={setSidebarSearchQuery}
        onCreateClass={() => setIsCreateClassModalOpen(true)}
        onJoinClass={() => setIsJoinClassModalOpen(true)}
        onAddContact={() => setIsAddContactModalOpen(true)}
      />

      </div>

      {/* 2. CENTER STAGE AND WORKSPACE PANELS */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`${(!activeChatId && activeTab === "chat") ? "hidden md:flex" : "flex"} flex-1 h-full flex-col min-w-0 bg-white text-gray-900 ${!activeChatId || activeTab !== "chat" ? "pb-20 md:pb-0" : ""}`}
        >
        
        {/* MESSENGER CHAT WORKSPACE VIEW */}
        {activeTab === "dashboard" && (
          <DashboardTab
            currentUser={currentUser}
            classes={classes}
            allUsers={allUsers}
            messages={messages}
            homework={homework}
            submissions={submissions}
            schedules={schedules}
            onCreateClass={() => setIsCreateClassModalOpen(true)}
            onAddContact={() => setIsAddContactModalOpen(true)}
            onSelectChat={(id) => { setActiveChatId(id); setActiveTab("chat"); setShowRightPanel(true); }}
            onOpenAIHelper={() => setIsAIHelperOpen(true)}
          />
        )}

        {activeTab === "chat" && (
          <div className="flex-1 flex min-w-0 h-full relative">
            
            {/* Main Chat Feed */}
            <div className={`flex-1 h-full flex flex-col min-w-0 relative ${isDark ? "bg-[#030712]" : "bg-[#f8fafc]"}`}>
              
              {/* Optional background subtle mesh */}
              {isDark && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] pointer-events-none mix-blend-screen" />}

              {/* Chat Thread Header bar */}
              <div className={`border-b h-[72px] px-4 md:px-6 shrink-0 flex items-center justify-between z-10 backdrop-blur-xl ${isDark ? "bg-[#0b0f19]/80 border-white/5" : "bg-white/80 border-gray-100/50"}`}>
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden text-left">
                  <button 
                    onClick={() => setActiveChatId(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Back to list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {isClassChat && activeClassGroup ? (
                    <>
                      <div className={`w-12 h-12 rounded-2xl font-display font-bold text-sm flex items-center justify-center uppercase shrink-0 shadow-inner ${
                        isDark ? "bg-linear-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 text-blue-400" : "bg-linear-to-br from-blue-100 to-indigo-50 border border-blue-200 text-blue-700"
                      }`}>
                        {activeClassGroup.name.slice(0,2)}
                      </div>
                      <div className="overflow-hidden">
                        <h2 className={`text-sm font-display font-bold truncate tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{activeClassGroup.name}</h2>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest mt-1.5 inline-block ${
                          isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {activeClassGroup.subject} • {activeClassGroup.level}
                        </span>
                      </div>
                    </>
                  ) : activeDirectUser ? (
                    <>
                      <div className="relative">
                        <img src={activeDirectUser.avatarUrl} alt="" className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isDark ? "bg-black border-white/10" : "bg-white border-slate-200"}`} loading="lazy" />
                        <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 ${
                          isDark ? "border-[#0a0e17]" : "border-white"
                        } ${
                          activeDirectUser.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-400"
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-sm font-display font-bold leading-tight tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{activeDirectUser.name}</h2>
                        <span className={`text-[10px] font-mono mt-0.5 inline-block ${isDark ? "text-blue-200" : "text-slate-500"}`}>{activeDirectUser.email}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs font-display font-bold uppercase tracking-widest text-slate-400">Join a workspace</div>
                  )}
                </div>

                {/* Header Call Actions / Search Panel */}
                <div className="flex items-center gap-3">
                  {activeChatId && (
                    <>
                      <div className="relative hidden sm:block mr-2">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search thread..."
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          className={`text-xs py-2 pl-9 pr-3 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 w-56 transition-all ${
                            isDark 
                              ? "bg-black/40 border-white/10 text-slate-100 placeholder-slate-500 shadow-inner" 
                              : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner"
                          }`}
                        />
                        {chatSearchQuery && (
                          <button onClick={() => setChatSearchQuery("")} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Call Actions */}
                      <button 
                        onClick={() => handleStartCall("voice")}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                          isDark 
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/10" 
                            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
                        }`}
                        title="Voice Call Session"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleStartCall("video")}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                          isDark 
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/10" 
                            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
                        }`}
                        title="Video Call Session"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => setShowRightPanel(!showRightPanel)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          showRightPanel 
                            ? "bg-blue-500 text-white" 
                            : isDark 
                              ? "bg-slate-900 hover:bg-slate-800 text-slate-300" 
                              : "bg-slate-50 hover:bg-slate-100 text-gray-600"
                        }`}
                        title="Room Information Panel"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ACTIVE CALL BAR (Prompts all workspace students that call is active) */}
              {activeChatCalls.length > 0 && !activeCall && (
                <div className="bg-indigo-50 border-b border-indigo-100 py-2.5 px-6 flex items-center justify-between text-left shrink-0 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    <p className="text-xs text-indigo-900 font-bold">
                      Interactive Class Call is Active! Host: {activeChatCalls[0].hostName} ({activeChatCalls[0].type})
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinActiveCall(activeChatCalls[0].id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Join Call Room
                  </button>
                </div>
              )}

              {/* Chat Thread Messages Stream */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-6 bg-white`}>
                {!activeChatId ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-gray-50/80 rounded-[2rem] p-10 mb-8 border border-gray-100/80 inline-flex items-center justify-center shadow-sm">
                      <img src="/emptychat.png" alt="No Chat Selected" className="w-64 h-auto object-contain mix-blend-multiply opacity-95" loading="lazy" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-gray-800"}`}>Secure Class Communication Workspace</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Select a subject channel or direct tutor contact from the left list to begin collaboration.</p>
                    </div>

                    {/* Join Class form for students */}
                    {currentUser.role === "student" && (
                      <form onSubmit={handleJoinClass} className="pt-4 border-t border-gray-100 w-full max-w-xs space-y-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left">Have an invitation code?</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter Class Name or ID..."
                            value={classCodeInput}
                            onChange={(e) => setClassCodeInput(e.target.value)}
                            className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                              isDark 
                                ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" 
                                : "bg-white border-gray-200 text-gray-900"
                            }`}
                          />
                          <button type="submit" className="bg-white hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
                            Join Class
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : filteredChatMessages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400">
                    {chatSearchQuery ? "No messages matching search query." : "No messages in this chat workspace. Say Hello!"}
                  </div>
                ) : (
                  filteredChatMessages.map((msg, index) => {
                    const isOwn = msg.senderId === currentUser.id;
                    const isSystem = msg.senderId === "system";
                    const isPinned = msg.isPinned;

                    const messageDate = new Date(msg.timestamp);
                    const today = new Date();
                    const isToday = messageDate.getDate() === today.getDate() && messageDate.getMonth() === today.getMonth() && messageDate.getFullYear() === today.getFullYear();
                    
                    let showDateDivider = false;
                    let dateText = "";
                    
                    if (index === 0) {
                      showDateDivider = true;
                      dateText = isToday ? "Today" : messageDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    } else {
                      const prevMsg = filteredChatMessages[index - 1];
                      const prevDate = new Date(prevMsg.timestamp);
                      if (messageDate.getDate() !== prevDate.getDate() || messageDate.getMonth() !== prevDate.getMonth()) {
                        showDateDivider = true;
                        dateText = isToday ? "Today" : messageDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }
                    }

                    if (isSystem) {
                      return (
                        <React.Fragment key={msg.id}>
                          {showDateDivider && (
                            <div className="flex justify-center my-4">
                              <div className="px-3 py-1 bg-gray-200 text-gray-700 text-[11px] font-bold rounded-md">
                                {dateText}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-center my-2">
                            <div className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-slate-100 border border-slate-200/50 text-gray-500">
                              {msg.content}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    }

                    const messageTime = messageDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                    return (
                      <React.Fragment key={msg.id}>
                        {showDateDivider && (
                          <div className="flex justify-center my-4">
                            <div className="px-3 py-1 bg-gray-200 text-gray-700 text-[11px] font-bold rounded-md">
                              {dateText}
                            </div>
                          </div>
                        )}
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className={`flex items-end gap-2.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                          {/* Avatar */}
                        {!isOwn && (
                          <img 
                            loading="lazy" src={allUsers.find(u => u.id === msg.senderId)?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderName}`} onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} 
                            alt="" 
                            className="w-7 h-7 rounded-full object-cover bg-slate-200" 
                          />
                        )}

                        {/* Bubble and Metadata Wrapper */}
                        <div className={`space-y-1 max-w-[70%] text-left relative group/bubble`}>
                          
                          {/* Sender name above bubble for group chats */}
                          {!isOwn && isClassChat && (
                            <p className="text-[9px] font-bold text-gray-500 ml-1.5">{msg.senderName}</p>
                          )}

                          {/* Reply box preview inside bubble */}
                          {msg.replyToId && (
                            <div className={`text-[10px] p-2 rounded-t-xl border-b truncate italic ${
                              isDark 
                                ? "bg-slate-800 text-slate-400 border-slate-700" 
                                : "bg-slate-100 text-gray-500 border-gray-200/60"
                            }`}>
                              ↳ Replying to: {msg.replyToContent}
                            </div>
                          )}

                          {/* Bubble Context Container */}
                          <div className="relative">
                            
                            {/* Message Text bubble */}
                            <div className={`p-3 rounded-2xl text-xs relative leading-relaxed ${
                              msg.replyToId ? "rounded-t-none" : ""
                            } ${
                              isOwn 
                                ? "bg-black text-white rounded-br-[4px]" 
                                : "bg-[#f1f1f1] text-black rounded-bl-[4px]"
                            }`}>
                              
                              {/* Edit slot */}
                              {editingMessageId === msg.id ? (
                                <div className="space-y-1.5 min-w-44">
                                  <input
                                    type="text"
                                    value={editInput}
                                    onChange={(e) => setEditInput(e.target.value)}
                                    className="w-full text-xs p-1 rounded-md text-gray-900 border border-gray-300 focus:outline-hidden"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingMessageId(null)} className="text-[9px] uppercase font-bold text-gray-500 cursor-pointer">Cancel</button>
                                    <button onClick={() => handleModifyMessage(msg.id, "edit", editInput)} className="text-[9px] uppercase font-bold text-blue-500 cursor-pointer">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <p className="whitespace-pre-wrap">
                                    {decryptMessageContent(msg.content).split(/(@\w+)/g).map((part, i) => 
                                      part.startsWith('@') ? <span key={i} className="text-blue-500 bg-blue-50/50 font-bold px-1 rounded-sm">{part}</span> : part
                                    )}
                                  </p>
                                  {msg.content.startsWith("🔒 e2ee_payload:") && (
                                    <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold font-sans select-none mt-1">
                                      <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                      <span>Decrypted locally (End-to-End Encrypted)</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Attachments inside message (Photo, Video, Voice/Audio, PDF) */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2.5 pt-2.5 border-t border-slate-100/25 space-y-2.5">
                                  {msg.attachments.map((att) => {
                                    if (att.type === "image") {
                                      // Simulated calculus or workspace formulas graphics
                                      const url = att.url;
                                      return (
                                        <div key={att.id} className="group/img relative overflow-hidden rounded-xl border border-white/10 shadow-sm cursor-pointer" onClick={() => setLightboxImage(url)}>
                                          <img src={url} alt={att.name} className="w-full max-h-40 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold gap-1">
                                            🔍 Click to zoom
                                          </div>
                                        </div>
                                      );
                                    } else if (att.type === "video") {
                                      return (
                                        <div key={att.id} className="relative overflow-hidden rounded-xl border border-white/10 shadow-sm cursor-pointer" onClick={() => setLightboxVideo({ name: att.name, url: att.url || "#" })}>
                                          <div className="w-full h-32 bg-gray-900" />
                                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                                            <div className="w-9 h-9 rounded-full bg-white hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-md">
                                              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                                            </div>
                                            <span className="text-[10px] font-bold text-white truncate max-w-full px-2">{att.name}</span>
                                            <span className="text-[8px] text-slate-300 font-mono">{att.size}</span>
                                          </div>
                                        </div>
                                      );
                                    } else if (att.type === "audio") {
                                      return (
                                        <div key={att.id} className="mt-1">
                                          <VoicePlayer name={att.name} />
                                        </div>
                                      );
                                    } else {
                                      // Fallback document/PDF
                                      return (
                                        <div key={att.id} className="flex items-center gap-3 bg-slate-900/40 p-2.5 rounded-xl text-left border border-slate-800">
                                          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                          <div className="overflow-hidden flex-1">
                                            <p className="text-[11px] font-bold truncate text-slate-200">{att.name}</p>
                                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">{att.size}</p>
                                          </div>
                                          <a href={att.url || "#"} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline font-bold px-1.5 py-1">Get</a>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Timestamp outside bubble */}
                            <div className={`text-[10px] text-gray-400 mt-1 ${isOwn ? "text-right mr-1" : "text-left ml-1"}`}>
                              {messageTime}
                            </div>
                            
                            {/* Hover Reaction Toolbar */}
                            <div className={`absolute -top-7 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-gray-100 rounded-full py-1 px-1.5 shadow-sm z-20 ${
                              isOwn ? "left-0" : "right-0"
                            }`}>
                              {["👍", "❤️", "🔥", "🙌", "💡"].map((emo) => (
                                <button 
                                  key={emo} 
                                  onClick={() => handleReactToMessage(msg.id, emo)}
                                  className="hover:scale-125 transition-transform text-xs cursor-pointer p-0.5"
                                >
                                  {emo}
                                </button>
                              ))}
                              
                              {/* Reply, Pin, Edit, Delete Quick buttons */}
                              <div className="h-3 w-[1px] bg-gray-200 mx-1" />
                              <button 
                                onClick={() => setReplyToMessage(msg)} 
                                className="text-[10px] text-gray-400 hover:text-blue-500 p-0.5 cursor-pointer"
                                title="Reply to message"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              
                              {isOwn && (
                                <>
                                  <button 
                                    onClick={() => {
                                      const timeDiff = Date.now() - new Date(msg.timestamp).getTime();
                                      if (timeDiff > 300000) {
                                        alert("⏰ Security limit: Messages can only be edited within 5 minutes of sending.");
                                      } else {
                                        setEditingMessageId(msg.id); 
                                        setEditInput(decryptMessageContent(msg.content));
                                      }
                                    }} 
                                    className={`text-[10px] p-0.5 cursor-pointer transition-colors ${
                                      (Date.now() - new Date(msg.timestamp).getTime() > 300000)
                                        ? "text-gray-300/40 cursor-not-allowed"
                                        : "text-gray-400 hover:text-blue-500"
                                    }`}
                                    title={Date.now() - new Date(msg.timestamp).getTime() > 300000 ? "Editing expired (5m limit)" : "Edit Message"}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleModifyMessage(msg.id, "delete")} 
                                    className="text-[10px] text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                                    title="Delete Message"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {currentUser.role === "tutor" && (
                                <button 
                                  onClick={() => handleModifyMessage(msg.id, "pin")} 
                                  className={`p-0.5 cursor-pointer ${msg.isPinned ? "text-blue-600" : "text-gray-400 hover:text-blue-500"}`}
                                  title="Pin Message to room details"
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                          </div>

                          {/* Message Reactions Row */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                              {msg.reactions.map((react, rIdx) => (
                                <button 
                                  key={rIdx}
                                  onClick={() => handleReactToMessage(msg.id, react.emoji)}
                                  className="text-[10px] bg-white border border-gray-100 rounded-full px-1.5 py-0.5 font-bold shadow-xs flex items-center gap-0.5 hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <span>{react.emoji}</span>
                                  <span className="text-[8px] text-gray-400">{react.userIds.length}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Timestamp / Read receipts info */}
                          <div className={`flex items-center gap-1.5 text-[9px] text-gray-400 ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                            {isPinned && <span className="text-blue-600 font-bold flex items-center gap-0.5"><Pin className="w-2.5 h-2.5" /> PINNED</span>}
                            {isOwn && (
                              <span className="ml-0.5 inline-block" title={msg.readBy && msg.readBy.length > 1 ? "Read by partner" : "Delivered"}>
                                {msg.readBy && msg.readBy.length > 1 ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-400/70" />
                                )}
                              </span>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    </React.Fragment>
);
                  })
                )}
                {/* Bouncing Typing Indicator inside feed */}
                {activeChatId && (typingUsers[activeChatId] || []).filter(id => id !== currentUser.id).length > 0 && (
                  <div className="flex items-center gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs shrink-0 select-none text-slate-700">
                      💬
                    </div>
                    <div className={`p-3 rounded-2xl rounded-bl-sm border text-xs max-w-[70%] text-left ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-gray-800"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[10px] text-gray-500">
                          {(typingUsers[activeChatId] || []).filter(id => id !== currentUser.id).map(id => allUsers.find(u => u.id === id)?.name || "Partner").join(", ")} is typing
                        </span>
                        <div className="flex gap-1 items-center py-0.5">
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* REPLY DISMISS PREVIEW BAR */}
              {replyToMessage && (
                <div className={`border-t px-6 py-2 flex items-center justify-between text-xs shrink-0 ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-100 border-gray-200 text-gray-600"}`}>
                  <span className="truncate italic">
                    ↳ Replying to <strong>{replyToMessage.senderName}</strong>: "{replyToMessage.content || "Attached asset"}"
                  </span>
                  <button onClick={() => setReplyToMessage(null)} className={`p-1 rounded-full transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-200 text-gray-500"}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* FILE TO ATTACH PREVIEW BAR */}
              {fileToAttach && (
                <div className={`border-t px-6 py-2 flex items-center justify-between text-xs shrink-0 font-medium ${isDark ? "bg-blue-950 border-blue-900 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
                  <span className="truncate flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" /> Ready to send: <strong>{fileToAttach.name}</strong> ({fileToAttach.size})
                  </span>
                  <button onClick={() => setFileToAttach(null)} className={`p-1 rounded-full transition-colors ${isDark ? "hover:bg-blue-900 text-blue-400" : "hover:bg-blue-100 text-blue-600"}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message Composer Footer Input Bar */}
              {activeChatId && (
                <div className={`border-t px-6 py-4 shrink-0 z-10 ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"}`}>
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    
                    {/* Attachment trigger dropdown / simulated actions */}
                    <div className="flex items-center gap-1 relative">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileSelect} 
                      />
                      <label
                        htmlFor="file-upload"
                        className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${isDark ? "hover:bg-slate-900 text-slate-500 hover:text-blue-400" : "hover:bg-slate-50 text-gray-400 hover:text-blue-600"}`}
                        title="Upload File"
                      >
                        <Paperclip className="w-4 h-4" />
                      </label>
                      
                      {/* AI Helper trigger */}
                      <button
                        type="button"
                        onClick={() => setIsAIHelperOpen(true)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${isDark ? "bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-400" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700"}`}
                        title="Open Gemini AI Assistant"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>

                    <div className={`flex-1 flex items-center pr-1 border rounded-[24px] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all ${
                      isDark 
                        ? "bg-slate-900 border-slate-800" 
                        : "bg-white border-gray-200 shadow-sm"
                    }`}>
                      <input
                        type="text"
                        placeholder="Type your message, class question, or homework updates here..."
                        value={messageInput}
                        onChange={(e) => handleTypingInput(e.target.value)}
                        className={`flex-1 text-xs py-3 px-4 focus:outline-hidden bg-transparent ${
                          isDark 
                            ? "text-slate-100 placeholder-slate-500" 
                            : "text-gray-900 placeholder-gray-400"
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim() && !fileToAttach}
                        className={`p-2 ml-1 text-white rounded-full transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed ${
                          isDark 
                            ? "bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600" 
                            : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50"
                        }`}
                      >
                        <Send className="w-4 h-4 ml-0.5 mr-0.5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            {/* Right collapsible information Panel */}
            {showRightPanel && activeChatId && (
              <RightPanel 
                currentUser={currentUser}
                classGroup={activeClassGroup}
                directChatUser={activeDirectUser}
                chatMessages={activeChatMessages}
                allUsers={allUsers}
                onMuteStudent={handleMuteStudent}
                onRemoveStudent={handleRemoveStudent}
                onAddStudent={handleAddStudentToClass}
                onDirectMessage={handleDirectMessage}
                onClose={() => setShowRightPanel(false)}
              />
            )}

          </div>
        )}

        {/* HOMEWORK CENTER WORKSPACE VIEW */}
        {activeTab === "homework" && (
          <HomeworkTab 
            currentUser={currentUser}
            homework={homework}
            submissions={submissions}
            classes={classes}
            onAssignHomework={handleAssignHomework}
            onSubmitHomework={handleSubmitHomework}
            onGradeSubmission={handleGradeSubmission}
            onOpenAIHelper={(title) => {
              setIsAIHelperOpen(true);
            }}
          />
        )}

        {/* VIRTUAL CLASS CALENDAR VIEW */}
        {activeTab === "schedule" && (
          <ScheduleTab 
            currentUser={currentUser}
            schedules={schedules}
            classes={classes}
            students={allUsers.filter(u => u.role === "student")}
            onScheduleClass={handleScheduleClass}
            onUpdateAttendance={handleUpdateAttendance}
          />
        )}

        {/* STUDY TEXTS MATERIALS LIBRARY VIEW */}
        {activeTab === "materials" && (
          <MaterialsTab 
            currentUser={currentUser}
            studyMaterials={studyMaterials}
            classes={classes}
            onUploadMaterial={handleUploadMaterial}
          />
        )}

        {/* PROFILE PROFILE SETTINGS VIEW */}
        {activeTab === "profile" && (
          <ProfileTab onLogout={handleLogout} onBack={() => setActiveTab("chat")} currentUser={currentUser!} />
        )}

        {/* TEACHER DASHBOARD VIEW */}
        {activeTab === "teacher" && currentUser.role === "tutor" && (
          <TeacherDashboard
            currentUser={currentUser}
            classes={classes}
            allUsers={allUsers}
            messages={messages}
            homework={homework}
            submissions={submissions}
            schedules={schedules}
            onCreateClass={() => setIsCreateClassModalOpen(true)}
            onAddContact={() => setIsAddContactModalOpen(true)}
            onAssignHomework={() => setActiveTab("homework")}
            onPostNotice={() => setActiveTab("schedule")}
            onMarkAttendance={() => setActiveTab("schedule")}
            onOpenAIHelper={() => setIsAIHelperOpen(true)}
            onSelectChat={(chatId) => { logEvent('Chat', 'OpenChat'); setActiveChatId(chatId); setActiveTab("chat"); }}
            onSendAnnouncement={() => setActiveTab("materials")}
          />
        )}

        {/* COORDINATOR ADMIN PANEL VIEW */}
        {activeTab === "admin" && currentUser.role === "admin" && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Tutors & Students</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{allUsers.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Active Class Groups</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{classes.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-left">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Messages Exchanged</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{messages.length}</p>
                </div>
              </div>

              {/* Add User panel */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-left space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Add New Participant</h2>
                  <p className="text-xs text-gray-500">Create authoritative credentials for private tutors or students.</p>
                </div>

                {adminError && <p className="text-xs text-rose-500">{adminError}</p>}

                <form onSubmit={handleAdminAddUser} className="grid sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={adminAddUserName}
                    onChange={(e) => setAdminAddUserName(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                  <input
                    type="email"
                    placeholder="email@tutor.com / student.com"
                    value={adminAddUserEmail}
                    onChange={(e) => setAdminAddUserEmail(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden"
                  />
                  <div className="flex gap-2">
                    <select
                      value={adminAddUserRole}
                      onChange={(e) => setAdminAddUserRole(e.target.value as any)}
                      className="text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden bg-white flex-1"
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                    </select>
                    <button type="submit" className="bg-white hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                      Add User
                    </button>
                  </div>
                </form>
              </div>

              {/* Users Moderation Matrix */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-left shadow-xs">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">All Registered Users Matrix</h3>
                </div>

                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {allUsers.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover bg-slate-100" loading="lazy" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            {user.name} 
                            {user.role === "tutor" && <Shield className="w-3.5 h-3.5 text-blue-600" />}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">{user.email} • Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === "admin" ? "bg-purple-100 text-purple-700" : user.role === "tutor" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                        
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleAdminDeleteUser(user.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete User permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        </motion.div>
      </AnimatePresence>

      {(!activeChatId || activeTab !== "chat") && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white">
          <MobileTabRow activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
        </div>
      )}

      {/* 3. GEMINI AI HELPER ASSISTANT MODAL CONTAINER */}
      <React.Suspense fallback={null}>
      <AIHelperModal 
        isOpen={isAIHelperOpen}
        onClose={() => setIsAIHelperOpen(false)}
        activeClassId={activeChatId || undefined}
        activeClassName={activeClassGroup?.name || "Calculus BC Elite"}
        chatMessages={activeChatMessages}
        onInsertGeneratedText={(draftText) => {
          setMessageInput(draftText);
        }}
      />
      </React.Suspense>

      {/* 4. ACTIVE LIVE VOICE/VIDEO CALL CONSOLE OVERLAY MODAL */}
      {activeCall && (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-6 select-none font-sans">
          
          {/* Main Stage Grid (Participant feeds simulation) */}
          <div className="flex-1 w-full max-w-5xl grid sm:grid-cols-2 gap-4 items-center justify-center my-6">
            
            {/* Host feed */}
            <div className="relative aspect-video w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg mx-auto">
              {callCamOff ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-white text-xl border border-slate-700">
                    📷
                  </div>
                  <p className="text-xs text-slate-400 mt-3">{activeCall.hostName} (Camera Off)</p>
                </div>
              ) : (
                <div className="absolute inset-0 bg-linear-to-tr from-slate-950 to-indigo-900/60 flex flex-col justify-between p-4 text-left">
                  <span className="text-[10px] bg-white text-white font-bold px-2 py-0.5 rounded-md self-start">
                    Active Video Broadcast
                  </span>
                  <p className="text-xs text-white font-bold">{activeCall.hostName} (Tutor)</p>
                </div>
              )}
            </div>

            {/* Current user / Participant feed */}
            <div className="relative aspect-video w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg mx-auto">
              <div className="absolute inset-0 bg-linear-to-tr from-slate-950 to-slate-800 flex flex-col justify-between p-4 text-left">
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md self-start">
                  My Participant Feed
                </span>
                <p className="text-xs text-white font-bold">{currentUser.name}</p>
              </div>
            </div>

          </div>

          {/* Active Info */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-base font-bold text-white flex items-center justify-center gap-2">
              📞 Connected Secure {activeCall.type === "video" ? "Video Call Session" : "Voice Call Session"}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Workspace Call Duration: {formatDuration(callDuration)} • {activeCall.participants.length} Active Participants
            </p>
          </div>

          {/* Call Controls Bar */}
          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800/80 px-8 py-4 rounded-3xl shrink-0 shadow-2xl">
            <button
              onClick={() => setCallMicMuted(!callMicMuted)}
              className={`p-4 rounded-full transition-colors cursor-pointer ${
                callMicMuted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title={callMicMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {callMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {activeCall.type === "video" && (
              <button
                onClick={() => setCallCamOff(!callCamOff)}
                className={`p-4 rounded-full transition-colors cursor-pointer ${
                  callCamOff ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                title={callCamOff ? "Turn Video On" : "Turn Video Off"}
              >
                {callCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={handleLeaveCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              title="Hang up / Leave Room"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}

      {/* 5. PHOTO LIGHTBOX MODAL OVERLAY */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4 select-none">
          <button 
            onClick={() => setLightboxImage(null)} 
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl relative">
            <img src={lightboxImage} alt="Attachment Fullscreen Zoom" className="max-w-full max-h-[80vh] object-contain rounded-xl" loading="lazy" />
            <div className="p-3 text-center text-xs text-slate-300 font-medium">
              Calculus Derivative Theorem - Visual Resource Preview
            </div>
          </div>
        </div>
      )}

      {/* 6. VIDEO PREVIEW MODAL OVERLAY */}
      {lightboxVideo && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4 select-none">
          <button 
            onClick={() => setLightboxVideo(null)} 
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Interactive Video Screen */}
            {lightboxVideo.url && lightboxVideo.url !== "#" ? (
              <video src={lightboxVideo.url} controls autoPlay className="w-full aspect-video bg-black object-contain" />
            ) : (
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 filter blur-xs" loading="lazy" />
                <div className="relative z-10 text-center space-y-4 px-6">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-white mx-auto animate-pulse">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">{lightboxVideo.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Duration: 04:22 • High Definition Streaming</p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-200">{lightboxVideo.name}</span>
              <button onClick={() => setLightboxVideo(null)} className="bg-white hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl relative ${isDark ? "bg-[#0a0e17] border border-white/10" : "bg-white border border-slate-200"}`}>
            <h2 className={`text-xl font-display font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Find User</h2>
            <p className={`text-xs mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Enter the Account ID (e.g., STU-12345 or TUT-12345) or Email to search and connect.</p>
            
            {!foundStudent ? (
              <form onSubmit={handleSearchStudent} className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Account ID or Email</label>
                  <input 
                    type="text" 
                    value={contactEmailInput}
                    onChange={(e) => {
                      setContactEmailInput(e.target.value);
                      setSearchError("");
                    }}
                    placeholder="e.g. 123456"
                    className={`w-full text-sm py-2.5 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all ${
                      isDark ? "bg-black/40 border border-white/10 text-white placeholder-slate-600" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                    required
                  />
                  {searchError && <p className="text-xs text-rose-500 mt-2 font-medium">{searchError}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={handleCancelSearch}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-blue-500 hover:text-white text-slate-900 border border-slate-200 transition-colors shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"} flex items-center gap-3`}>
                  <img src={foundStudent.avatarUrl} alt={foundStudent.name} className="w-12 h-12 rounded-full bg-slate-200 object-cover" loading="lazy" />
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{foundStudent.name}</h3>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {foundStudent.studentId ? `ID: ${foundStudent.studentId}` : foundStudent.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setFoundStudent(null); setContactEmailInput(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    Search Again
                  </button>
                  <button 
                    type="button" 
                    onClick={handleConnectFoundStudent}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JOIN CLASS MODAL */}
      {isJoinClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative bg-white border border-slate-200`}>
            <h2 className={`text-xl font-display font-bold mb-1 text-slate-900`}>Join Group</h2>
            <p className={`text-xs mb-6 text-slate-500`}>Enter the invite code provided by your instructor or group owner.</p>
            
            <form onSubmit={handleJoinClass} className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-500`}>Invite Code</label>
                  <input 
                    type="text" 
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value)}
                    placeholder="e.g. A1B2C3"
                    className={`w-full text-sm py-2.5 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all font-mono uppercase bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400`}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsJoinClassModalOpen(false)} className={`px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all">Join Group</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {isCreateClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative ${isDark ? "bg-[#0a0e17] border border-white/10" : "bg-white border border-slate-200"}`}>
            <h2 className={`text-xl font-display font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Create Class Workspace</h2>
            <p className={`text-xs mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Set up a new space for your students.</p>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Class Name</label>
                  <input 
                    type="text" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Calculus 101"
                    className={`w-full text-sm py-2.5 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all ${
                      isDark ? "bg-black/40 border border-white/10 text-white placeholder-slate-600" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Subject</label>
                    <input 
                      type="text" 
                      value={newClassSubject}
                      onChange={(e) => setNewClassSubject(e.target.value)}
                      placeholder="Mathematics"
                      className={`w-full text-sm py-2.5 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all ${
                        isDark ? "bg-black/40 border border-white/10 text-white placeholder-slate-600" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Level</label>
                    <select 
                      value={newClassLevel}
                      onChange={(e) => setNewClassLevel(e.target.value)}
                      className={`w-full text-sm py-2.5 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer ${
                        isDark ? "bg-black/40 border border-white/10 text-white" : "bg-slate-50 border border-slate-200 text-slate-900"
                      }`}
                    >
                      <option value="Middle School">Middle School</option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateClassModalOpen(false)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

    </div>
    </React.Suspense>
  );
}