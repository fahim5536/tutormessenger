import React from "react";
import { motion } from "framer-motion";
import { User, ClassGroup, Message, Homework, Submission, ClassSchedule } from "../types";
import { Users, FileText, CheckCircle, Calendar, Plus, MessageSquare, Send, BookOpen, Clock, Activity, Target, Sparkles, TrendingUp } from "lucide-react";

interface DashboardTabProps {
  currentUser: User;
  classes: ClassGroup[];
  allUsers: User[];
  messages: Message[];
  homework: Homework[];
  submissions: Submission[];
  schedules: ClassSchedule[];
  onCreateClass: () => void;
  onAddContact: () => void;
  onSelectChat: (chatId: string) => void;
  onOpenAIHelper?: () => void;
}

export default function DashboardTab({
  currentUser,
  classes,
  allUsers,
  messages,
  homework,
  submissions,
  schedules,
  onCreateClass,
  onAddContact,
  onSelectChat,
  onOpenAIHelper,
}: DashboardTabProps) {
  const isTutor = currentUser.role === "tutor";
  
  // Calculate stats
  const activeClassesCount = classes.filter(c => c.memberIds.includes(currentUser.id)).length;
  const totalStudents = isTutor 
    ? [...new Set(classes.filter(c => c.memberIds.includes(currentUser.id)).flatMap(c => c.memberIds))].filter(id => id !== currentUser.id).length
    : 0;
  
  const pendingHomework = isTutor
    ? homework.filter(h => h.tutorId === currentUser.id && new Date(h.dueDate) >= new Date()).length
    : homework.filter(h => classes.some(c => c.id === h.classGroupId && c.memberIds.includes(currentUser.id))).length - submissions.filter(s => s.studentId === currentUser.id).length;

  const todayClasses = schedules.filter(s => {
    const sDate = new Date(s.startTime);
    const today = new Date();
    return sDate.getDate() === today.getDate() && sDate.getMonth() === today.getMonth() && sDate.getFullYear() === today.getFullYear() && classes.some(c => c.id === s.classGroupId && c.memberIds.includes(currentUser.id));
  });

  const recentMessages = messages
    .filter(m => m.senderId !== currentUser.id && classes.some(c => c.id === m.chatId && c.memberIds.includes(currentUser.id)))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
              Welcome back, {currentUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Here's what's happening {isTutor ? 'in your classes' : 'with your learning'} today.</p>
          </div>
          {isTutor && (
            <div className="flex items-center gap-3">
              <button onClick={onCreateClass} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Class
              </button>
            </div>
          )}
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{isTutor ? totalStudents : activeClassesCount}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{isTutor ? "Total Students" : "Active Classes"}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{Math.max(0, pendingHomework)}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{isTutor ? "Active Assignments" : "Pending Homework"}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{todayClasses.length}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Classes Today</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{isTutor ? "98%" : "A"}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{isTutor ? "Attendance Rate" : "Average Grade"}</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upcoming Classes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Upcoming Classes
                </h3>
              </div>
              <div className="p-2">
                {schedules.filter(s => new Date(s.startTime) >= new Date()).slice(0, 3).map((schedule, i) => {
                  const classInfo = classes.find(c => c.id === schedule.classGroupId);
                  if (!classInfo) return null;
                  const date = new Date(schedule.startTime);
                  
                  return (
                    <div key={schedule.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group" onClick={() => onSelectChat(classInfo.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50/50 flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                          <span className="text-[10px] font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-black leading-none">{date.getDate()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{schedule.title}</p>
                          <p className="text-sm text-gray-500">{classInfo.name} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {classInfo.memberIds.slice(0, 3).map(mid => {
                            const user = allUsers.find(u => u.id === mid);
                            return user ? <img key={mid} src={user.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" /> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {schedules.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No upcoming classes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Homework */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> {isTutor ? 'Recent Submissions' : 'Homework Due'}
                </h3>
              </div>
              <div className="p-2">
                {homework.slice(0, 4).map(hw => {
                  const classInfo = classes.find(c => c.id === hw.classGroupId);
                  if (!classInfo) return null;
                  const isSubmitted = submissions.some(s => s.homeworkId === hw.id && s.studentId === currentUser.id);
                  
                  if (!isTutor && isSubmitted) return null;

                  return (
                    <div key={hw.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group" onClick={() => onSelectChat(classInfo.id)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isSubmitted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {isSubmitted ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{hw.title}</p>
                          <p className="text-sm text-gray-500">{classInfo.name} • Due {new Date(hw.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          
          {/* Right Column (1/3) */}
          <div className="space-y-6">
            
            {/* Recent Messages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-500" /> Recent Messages
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {recentMessages.map(msg => {
                  const sender = allUsers.find(u => u.id === msg.senderId);
                  const chat = classes.find(c => c.id === msg.chatId);
                  if (!sender) return null;
                  
                  return (
                    <div key={msg.id} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex gap-3 group" onClick={() => onSelectChat(msg.chatId)}>
                      <img src={sender.avatarUrl} alt="" className="w-10 h-10 rounded-full shrink-0 object-cover border border-gray-100" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-bold text-gray-900 truncate">{sender.name.split(" ")[0]}</p>
                          <p className="text-[10px] text-gray-400 shrink-0">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {false && <p className="text-[10px] font-medium text-blue-500 mb-0.5 truncate">in {chat.name}</p>}
                        <p className="text-xs text-gray-500 truncate group-hover:text-gray-900 transition-colors">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                {recentMessages.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No recent messages</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Quick Card */}
            <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" /> AI Assistant
                </div>
                <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                  Stuck on a problem? Get instant hints and explanations from your AI tutor.
                </p>
                <button onClick={onOpenAIHelper} className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                  Ask AI Tutor <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
