
import React, { useState } from "react";
import SEO from "./SEO";
import { generateTutorProfileSchema } from "../lib/structuredData";

import { motion } from "framer-motion";
import { User, ClassGroup, Message, Homework, Submission, ClassSchedule } from "../types";
import { Users, FileText, UserPlus, CheckCircle, Search, Calendar, Plus, MessageSquare, Send, Bell, Settings, BookOpen, BarChart, Sparkles } from "lucide-react";

interface TeacherDashboardProps {
  currentUser: User;
  classes: ClassGroup[];
  allUsers: User[];
  messages: Message[];
  homework: Homework[];
  submissions: Submission[];
  schedules: ClassSchedule[];
  onCreateClass: () => void;
  onAddContact: () => void;
  onAssignHomework: () => void;
  onPostNotice: () => void;
  onMarkAttendance: () => void;
  onOpenAIHelper: () => void;
  onSelectChat: (chatId: string) => void;
  onSendAnnouncement: () => void;
}

export default function TeacherDashboard({
  currentUser,
  classes,
  allUsers,
  messages,
  homework,
  submissions,
  schedules,
  onCreateClass,
  onAddContact,
  onAssignHomework,
  onPostNotice,
  onMarkAttendance,
  onOpenAIHelper,
  onSelectChat,
  onSendAnnouncement
}: TeacherDashboardProps) {
  const isDark = currentUser.theme === "dark";
  const myStudents = allUsers.filter(u => u.role === "student");
  
  const [internalTab, setInternalTab] = useState<"overview" | "students" | "performance">("overview");


  return (
    <>
      <SEO 
        title={`${currentUser.name} - Teacher Dashboard | EduChat`}
        description={`View classes, students, and materials for ${currentUser.name}.`}
        url={`https://yourdomain.com/tutor/${currentUser.id}`}
        jsonLd={generateTutorProfileSchema(currentUser)}
      />
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isDark ? "bg-[#0a0e17] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Header & Subnav */}
      <div className={`shrink-0 px-4 md:px-8 pt-6 md:pt-8 pb-0 border-b ${isDark ? "border-white/10" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Teacher Workspace</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Welcome back, {currentUser.name}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onAddContact} className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors" title="Find Student by ID">
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAIHelper}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                isDark ? "bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              <Sparkles className="w-4 h-4" /> AI Assistant
            </button>
          </div>
        </div>
        
        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          <SubNavTab active={internalTab === "overview"} onClick={() => setInternalTab("overview")} label="Dashboard Overview" isDark={isDark} />
          <SubNavTab active={internalTab === "students"} onClick={() => setInternalTab("students")} label="Student Management" isDark={isDark} />
          <SubNavTab active={internalTab === "performance"} onClick={() => setInternalTab("performance")} label="Class Performance" isDark={isDark} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {internalTab === "overview" && (
            <OverviewPanel 
              isDark={isDark} 
              classes={classes} 
              myStudents={myStudents} 
              submissions={submissions}
              schedules={schedules}
              onSelectChat={onSelectChat}
              onCreateClass={onCreateClass}
              onAssignHomework={onAssignHomework}
              onMarkAttendance={onMarkAttendance}
              onSendAnnouncement={onSendAnnouncement}
            />
          )}
          {internalTab === "students" && (
            <StudentsPanel 
              isDark={isDark} 
              students={myStudents} 
              classes={classes}
              onSelectChat={onSelectChat}
              onAddContact={onAddContact}
              currentUser={currentUser}
            />
          )}
          {internalTab === "performance" && (
            <PerformancePanel 
              isDark={isDark} 
              classes={classes} 
              submissions={submissions}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}

function SubNavTab({ active, onClick, label, isDark }: { active: boolean, onClick: () => void, label: string, isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
        active 
          ? "border-blue-500 text-blue-600 dark:text-blue-400" 
          : `border-transparent ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`
      }`}
    >
      {label}
    </button>
  );
}

function OverviewPanel({ isDark, classes, myStudents, submissions, schedules, onSelectChat, onCreateClass, onAssignHomework, onMarkAttendance, onSendAnnouncement }: any) {

  return (

    <div className="space-y-8">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <ActionCard icon={<FileText />} label="New Homework" onClick={onAssignHomework} isDark={isDark} />
        <ActionCard icon={<Bell />} label="Announcement" onClick={onSendAnnouncement} isDark={isDark} />
        <ActionCard icon={<CheckCircle />} label="Attendance" onClick={onMarkAttendance} isDark={isDark} />
        <ActionCard icon={<Users />} label="New Group" onClick={onCreateClass} isDark={isDark} />
        <ActionCard icon={<Calendar />} label="Schedule" onClick={() => {}} isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Active Classes" value={classes.length} isDark={isDark} />
            <StatCard title="Total Students" value={myStudents.length} isDark={isDark} />
            <StatCard title="Pending Review" value={submissions.filter((s:any) => s.status === "pending").length} isDark={isDark} />
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-5">Your Class Groups</h2>
            <div className="space-y-3">
              {classes.length === 0 ? (
                <p className={`text-sm py-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>No active classes.</p>
              ) : (
                classes.map((cls:any) => (
                  <div key={cls.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-slate-100 bg-slate-50 hover:border-blue-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                        {cls.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[15px]">{cls.name}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{cls.memberIds.length} Participants • {cls.subject}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSelectChat(cls.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-5">Upcoming Schedule</h2>
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <p className={`text-sm py-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>No upcoming sessions.</p>
              ) : (
                schedules.slice(0, 4).map((sch:any) => (
                  <div key={sch.id} className="flex gap-4">
                    <div className="w-12 text-center shrink-0 pt-1">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">{new Date(sch.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-xl font-black leading-none mt-1">{new Date(sch.date).getDate()}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{sch.title}</p>
                      <p className={`text-[11px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{sch.startTime} - {sch.endTime}</p>
                      <p className={`text-[11px] truncate mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{sch.classGroupName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsPanel({ isDark, students, classes, onSelectChat, onAddContact, currentUser }: any) {
  const [search, setSearch] = useState("");
  const filtered = students.filter((s:any) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.studentId && s.studentId.includes(search)));


  return (

    <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider">Student Directory</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or 6-digit ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-hidden ${isDark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            />
          </div>
          <button onClick={onAddContact} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className={`border-b ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
              <th className="pb-3 font-semibold">Student</th>
              <th className="pb-3 font-semibold">Student ID</th>
              <th className="pb-3 font-semibold">Groups</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {filtered.map((student:any) => {
              const studentClasses = classes.filter((c:any) => c.memberIds.includes(student.id));
              return (
                <tr key={student.id} className="group">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatarUrl} alt="" className="w-9 h-9 rounded-full bg-slate-200 object-cover"  loading="lazy" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} />
                      <div>
                        <p className="font-bold">{student.name}</p>
                        <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs">{student.studentId || "N/A"}</td>
                  <td className="py-4">
                    <div className="flex gap-1 flex-wrap">
                      {studentClasses.length === 0 ? <span className="text-xs text-gray-400">None</span> : 
                        studentClasses.map((c:any) => (
                          <span key={c.id} className={`text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold ${isDark ? "bg-white/10" : "bg-slate-100"}`}>{c.name}</span>
                        ))
                      }
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${student.isOnline ? "text-emerald-500" : "text-slate-400"}`}>
                      <span className={`w-2 h-2 rounded-full ${student.isOnline ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                      {student.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="py-4">
                    <button 
                      onClick={() => onSelectChat(`${currentUser.id}_${student.id}`)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Direct Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">No students found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PerformancePanel({ isDark, classes, submissions }: any) {

  return (

    <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider">Class Performance & Attendance</h2>
      </div>
      
      <div className="space-y-6">
        {classes.map((cls:any) => {
          const classSubs = submissions.filter((s:any) => s.homeworkId.includes(cls.id) || true); // mock logic
          const graded = classSubs.filter((s:any) => s.status === "graded").length;
          const completionRate = classSubs.length > 0 ? Math.round((graded / classSubs.length) * 100) : 0;
          
          return (
            <div key={cls.id} className={`p-5 rounded-xl border ${isDark ? "border-white/10 bg-black/20" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">{cls.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                  {cls.memberIds.length} Students
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Homework Completion</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }}></div>
                    </div>
                    <span className="text-sm font-bold">{completionRate}%</span>
                  </div>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Average Attendance</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `85%` }}></div>
                    </div>
                    <span className="text-sm font-bold">85%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function ActionCard({ icon, label, onClick, isDark }: { icon: React.ReactNode, label: string, onClick: () => void, isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center transition-all hover:-translate-y-1 ${
        isDark ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 text-white shadow-sm" : "bg-white border-slate-200 hover:border-blue-500 hover:shadow-md text-slate-800"
      }`}
    >
      <div className={`p-2.5 rounded-full ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
        {React.cloneElement(icon as any, { className: "w-5 h-5" })}
      </div>
      <span className="text-[11px] font-bold tracking-tight">{label}</span>
    </button>
  );
}

function StatCard({ title, value, isDark }: { title: string, value: number, isDark: boolean }) {

  return (

    <div className={`p-5 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xs"}`}>
      <p className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{title}</p>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}