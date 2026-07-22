import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, UserCheck, AlertCircle, Plus, Sparkles, MapPin, CheckSquare, Trash2 } from "lucide-react";
import { ClassSchedule, ClassGroup, User } from "../types";

interface ScheduleTabProps {
  currentUser: User;
  schedules: ClassSchedule[];
  classes: ClassGroup[];
  students: User[];
  onScheduleClass: (payload: { classGroupId: string; title: string; date: string; startTime: string; endTime: string; description?: string }) => void;
  onUpdateAttendance: (scheduleId: string, studentIds: string[]) => void;
}

export default function ScheduleTab({
  currentUser,
  schedules,
  classes,
  students,
  onScheduleClass,
  onUpdateAttendance
}: ScheduleTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [classGroupId, setClassGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Attendance tracking state
  const [trackingScheduleId, setTrackingScheduleId] = useState<string | null>(null);

  // Filter classes and schedules to only those the user is a member of
  const myClassIds = classes.filter(c => c.memberIds.includes(currentUser.id)).map(c => c.id);
  const mySchedules = schedules.filter(s => myClassIds.includes(s.classGroupId));

  const [presentStudentIds, setPresentStudentIds] = useState<string[]>([]);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classGroupId || !title || !date || !startTime || !endTime) {
      setFormError("Please fill out all required fields.");
      return;
    }
    onScheduleClass({
      classGroupId,
      title,
      date,
      startTime,
      endTime,
      description
    });
    // Reset Form
    setClassGroupId("");
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setFormError("");
    setShowAddForm(false);
  };

  const startTracking = (sch: ClassSchedule) => {
    setTrackingScheduleId(sch.id);
    setPresentStudentIds(sch.attendance || []);
  };

  const handleToggleStudent = (studentId: string) => {
    if (presentStudentIds.includes(studentId)) {
      setPresentStudentIds(presentStudentIds.filter(id => id !== studentId));
    } else {
      setPresentStudentIds([...presentStudentIds, studentId]);
    }
  };

  const saveAttendance = () => {
    if (trackingScheduleId) {
      onUpdateAttendance(trackingScheduleId, presentStudentIds);
      setTrackingScheduleId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h1 className="text-base font-semibold text-gray-900">Virtual Classes & Attendance Planner</h1>
        </div>
        
        {currentUser.role === "tutor" && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" /> Schedule New Class
          </button>
        )}
      </div>

      <div className="p-4 md:p-6 overflow-y-auto flex-1 max-w-5xl w-full mx-auto space-y-6">
        
        {/* SCHEDULE NEW CLASS FORM (Tutors only) */}
        {showAddForm && currentUser.role === "tutor" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs max-w-xl mx-auto space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Schedule a Live Tutoring Session</h2>
              <p className="text-xs text-gray-500 font-medium">Create a digital calendar event for student groups</p>
            </div>

            {formError && (
              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" /> {formError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Class Group</label>
                <select
                  value={classGroupId}
                  onChange={(e) => setClassGroupId(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Choose Class Group --</option>
                  {classes.filter(c => c.memberIds.includes(currentUser.id)).map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Special Relativity Workshop, AP Integration drill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Agenda / Description</label>
                <textarea
                  rows={3}
                  placeholder="What will we study? e.g. Solve page 12 exercises..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 py-2 px-4 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-5 rounded-lg shadow-xs cursor-pointer"
                >
                  Add Class Schedule
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CALENDAR AGENDA LIST */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Upcoming Virtual Classes</h2>
          {mySchedules.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-xs text-gray-500 text-xs">
              No upcoming classes scheduled. Rest or plan ahead!
            </div>
          ) : (
            <div className="space-y-3">
              {mySchedules.map((sch) => {
                const cls = classes.find(c => c.id === sch.classGroupId);
                const classStudents = students.filter(s => cls?.memberIds.includes(s.id));
                const isTrackingAttendance = trackingScheduleId === sch.id;

                return (
                  <div key={sch.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-gray-200 transition-colors">
                    
                    {/* Time & Title Info */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center font-mono w-14 shrink-0">
                        <span className="text-[10px] font-bold uppercase">{new Date(sch.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}</span>
                        <span className="text-lg font-black leading-tight">{new Date(sch.date + "T00:00:00").toLocaleDateString(undefined, { day: "numeric" })}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-100 text-gray-600 font-bold px-2 py-0.5 rounded-md">
                            {sch.classGroupName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                            <Clock className="w-3.5 h-3.5" /> {sch.startTime} - {sch.endTime}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">{sch.title}</h3>
                        {sch.description && (
                          <p className="text-xs text-gray-500">{sch.description}</p>
                        )}
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> Virtual Secure Classroom In-App Call
                        </p>
                      </div>
                    </div>

                    {/* Attendance/Call Buttons */}
                    <div className="shrink-0 pt-2 md:pt-0">
                      {currentUser.role === "tutor" ? (
                        <div className="space-y-2 text-right">
                          {!isTrackingAttendance ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startTracking(sch)}
                                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Track Attendance
                              </button>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-left space-y-3 min-w-64 max-w-md shadow-xs">
                              <h4 className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                <CheckSquare className="w-4 h-4 text-blue-600" /> Student Attendance Sheet
                              </h4>
                              
                              {classStudents.length === 0 ? (
                                <p className="text-[10px] text-gray-400 italic">No students joined this class group yet.</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {classStudents.map((stud) => {
                                    const isPresent = presentStudentIds.includes(stud.id);
                                    return (
                                      <button
                                        type="button"
                                        key={stud.id}
                                        onClick={() => handleToggleStudent(stud.id)}
                                        className="w-full flex items-center justify-between text-left py-1 px-2 rounded-md hover:bg-gray-200/50 transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <img src={stud.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover bg-slate-100"  loading="lazy" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} />
                                          <span className="text-xs text-gray-700 font-medium">{stud.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                          isPresent ? "bg-green-100 text-green-700" : "bg-slate-100 text-gray-400"
                                        }`}>
                                          {isPresent ? "Present" : "Absent"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                                <button
                                  type="button"
                                  onClick={() => setTrackingScheduleId(null)}
                                  className="text-[10px] text-gray-500 font-medium py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={saveAttendance}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-md cursor-pointer"
                                >
                                  Save Attendance
                                </button>
                              </div>
                            </div>
                          )}

                          {sch.attendance && sch.attendance.length > 0 && !isTrackingAttendance && (
                            <p className="text-[10px] text-green-600 font-medium font-mono">
                              ✓ Attendance updated ({sch.attendance.length} Present)
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 text-right md:min-w-32">
                          {sch.attendance && sch.attendance.includes(currentUser.id) ? (
                            <span className="text-xs text-green-600 font-semibold flex items-center justify-end gap-1">
                              <UserCheck className="w-4 h-4" /> Marked Present
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No attendance records yet</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}