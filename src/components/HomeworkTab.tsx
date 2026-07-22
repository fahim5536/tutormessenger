import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Award, FileText, CheckCircle2, ChevronRight, Upload, Plus, AlertCircle, Sparkles } from "lucide-react";
import { Homework, Submission, ClassGroup, User, Attachment } from "../types";

interface HomeworkTabProps {
  currentUser: User;
  homework: Homework[];
  submissions: Submission[];
  classes: ClassGroup[];
  onAssignHomework: (payload: { classGroupId: string; title: string; description: string; dueDate: string; maxPoints: number; attachments?: Attachment[] }) => void;
  onSubmitHomework: (homeworkId: string, content: string, attachments?: Attachment[]) => void;
  onGradeSubmission: (submissionId: string, grade: string, feedback: string) => void;
  onOpenAIHelper: (title: string) => void;
}

export default function HomeworkTab({
  currentUser,
  homework,
  submissions,
  classes,
  onAssignHomework,
  onSubmitHomework,
  onGradeSubmission,
  onOpenAIHelper
}: HomeworkTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"assigned" | "submissions" | "new">("assigned");

  // Filter classes and homework to only those the user is a member of
  const myClassIds = classes.filter(c => c.memberIds.includes(currentUser.id)).map(c => c.id);
  const myHomework = homework.filter(h => myClassIds.includes(h.classGroupId));

  const [selectedHwId, setSelectedHwId] = useState<string | null>(null);

  // Homework Assign Form State
  const [classGroupId, setClassGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxPoints, setMaxPoints] = useState(100);
  const [assignError, setAssignError] = useState("");

  // Submit Homework Form State
  const [submissionContent, setSubmissionContent] = useState("");
  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [fileAttachedName, setFileAttachedName] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Grade State
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [gradingError, setGradingError] = useState("");

  // File upload simulation helper
  const [uploading, setUploading] = useState(false);

  const simulateFileUpload = (fileName: string) => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFileAttachedName(fileName);
    }, 1000);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classGroupId || !title || !description || !dueDate) {
      setAssignError("Please fill out all required fields.");
      return;
    }
    onAssignHomework({
      classGroupId,
      title,
      description,
      dueDate,
      maxPoints: Number(maxPoints),
      attachments: fileAttachedName ? [{
        id: "att_" + Date.now(),
        name: fileAttachedName,
        type: fileAttachedName.endsWith(".pdf") ? "pdf" : "doc",
        url: "#",
        size: "350 KB"
      }] : undefined
    });
    // Reset Form
    setClassGroupId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setMaxPoints(100);
    setFileAttachedName("");
    setAssignError("");
    setActiveSubTab("assigned");
  };

  const handleHomeworkSubmit = (hwId: string) => {
    if (!submissionContent.trim()) {
      setSubmitError("Submission content cannot be empty.");
      return;
    }
    onSubmitHomework(
      hwId, 
      submissionContent,
      fileAttachedName ? [{
        id: "att_sub_" + Date.now(),
        name: fileAttachedName,
        type: fileAttachedName.endsWith(".pdf") ? "pdf" : "doc",
        url: "#",
        size: "1.2 MB"
      }] : undefined
    );
    setSubmissionContent("");
    setFileAttachedName("");
    setSubmittingHwId(null);
    setSubmitError("");
    setActiveSubTab("assigned");
  };

  const handleGradeSubmit = (subId: string) => {
    if (!gradeValue.trim() || !feedbackValue.trim()) {
      setGradingError("Please enter both a grade and descriptive feedback.");
      return;
    }
    onGradeSubmission(subId, gradeValue, feedbackValue);
    setGradeValue("");
    setFeedbackValue("");
    setGradingSubId(null);
    setGradingError("");
  };

  const selectedHw = homework.find(h => h.id === selectedHwId);
  const associatedSubmissions = submissions.filter(s => s.homeworkId === selectedHwId);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Top Tabs Bar */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h1 className="text-base font-semibold text-gray-900">Academic Homework Center</h1>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
          <button 
            onClick={() => { setActiveSubTab("assigned"); setSelectedHwId(null); }}
            className={`py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${activeSubTab === "assigned" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"}`}
          >
            Assigned Tasks
          </button>
          {currentUser.role === "tutor" && (
            <button 
              onClick={() => { setActiveSubTab("new"); setSelectedHwId(null); }}
              className={`py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${activeSubTab === "new" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"}`}
            >
              <Plus className="w-3.5 h-3.5" /> Assign Homework
            </button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 overflow-y-auto flex-1 max-w-5xl w-full mx-auto space-y-6">
        
        {/* VIEW ASSIGNED HOMEWORK */}
        {activeSubTab === "assigned" && !selectedHwId && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">All Homework Workspaces</h2>
            {myHomework.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-xs text-gray-500 text-xs">
                No active homework assignments found. Keep up the good work!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myHomework.map((hw) => {
                  const studentSub = submissions.find(s => s.homeworkId === hw.id && s.studentId === currentUser.id);
                  const isSubmitted = !!studentSub;
                  const isGraded = studentSub?.status === "graded";

                  return (
                    <div key={hw.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                            {hw.classGroupName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Due: {hw.dueDate}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{hw.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-3 mb-4">{hw.description}</p>
                      </div>

                      <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                        <div>
                          {currentUser.role === "student" ? (
                            isSubmitted ? (
                              isGraded ? (
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Graded: {studentSub.grade}
                                </span>
                              ) : (
                                <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4 text-amber-500" /> Submitted (Pending Grade)
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-rose-500 font-medium">Not Submitted</span>
                            )
                          ) : (
                            <span className="text-xs text-gray-500 font-mono">
                              Max Points: {hw.maxPoints}
                            </span>
                          )}
                        </div>

                        <button 
                          onClick={() => setSelectedHwId(hw.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                        >
                          Workspace Detail <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* HOMEWORK WORKSPACE DETAIL */}
        {selectedHwId && selectedHw && (
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Details */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Main Board */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <button 
                  onClick={() => setSelectedHwId(null)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors cursor-pointer"
                >
                  ← Back to Homework list
                </button>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md">
                      {selectedHw.classGroupName}
                    </span>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due: {selectedHw.dueDate}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedHw.title}</h2>
                </div>

                <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-gray-100">
                  {selectedHw.description}
                </div>

                {selectedHw.attachments && selectedHw.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-700">Tutor Shared Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHw.attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div className="text-left">
                            <p className="text-[11px] font-medium text-gray-700 truncate max-w-40">{att.name}</p>
                            <p className="text-[9px] text-gray-400 font-mono">{att.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold">Max Score: {selectedHw.maxPoints} Points</span>
                  {currentUser.role === "student" && (
                    <button
                      onClick={() => onOpenAIHelper(selectedHw.title)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> Ask AI Homework Assistant
                    </button>
                  )}
                </div>
              </div>

              {/* Student Submit Area */}
              {currentUser.role === "student" && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-600" /> My Workspace Submission
                  </h3>

                  {submissions.some(s => s.homeworkId === selectedHw.id && s.studentId === currentUser.id) ? (
                    // Submission exists
                    (() => {
                      const mySub = submissions.find(s => s.homeworkId === selectedHw.id && s.studentId === currentUser.id)!;
                      return (
                        <div className="p-4 bg-slate-50 rounded-xl border border-gray-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Submitted successfully
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(mySub.submittedAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                            {mySub.content}
                          </p>

                          {mySub.attachments && mySub.attachments.length > 0 && (
                            <div className="flex items-center gap-2 bg-white border border-gray-100 py-1.5 px-3 rounded-lg max-w-xs">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <div className="text-left">
                                <p className="text-[10px] font-medium text-gray-700 truncate">{mySub.attachments[0].name}</p>
                                <p className="text-[8px] text-gray-400 font-mono">{mySub.attachments[0].size}</p>
                              </div>
                            </div>
                          )}

                          {mySub.status === "graded" ? (
                            <div className="mt-4 bg-green-50/50 border border-green-100 p-4 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-green-800 flex items-center gap-1">
                                  <Award className="w-4 h-4 text-green-600" /> Homework Grade Card
                                </span>
                                <span className="text-sm font-black text-green-700 font-mono bg-white px-2 py-0.5 rounded-md border border-green-200">
                                  {mySub.grade}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 italic bg-white p-3 rounded-lg border border-green-100">
                                <strong>Tutor Feedback:</strong> "{mySub.feedback}"
                              </p>
                            </div>
                          ) : (
                            <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg text-xs text-amber-800 font-medium">
                              Waiting for your tutor to review and grade. We'll notify you!
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    // Submit form
                    <div className="space-y-4">
                      {submitError && (
                        <div className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                          {submitError}
                        </div>
                      )}

                      <textarea
                        rows={4}
                        placeholder="Type out your answers or paste links, homework details here..."
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none bg-slate-50/30"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {/* Simulation trigger */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => simulateFileUpload(`${currentUser.name.replace(" ", "_")}_HW_Sub.pdf`)}
                            className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" /> Attach Solved PDF
                          </button>
                          {uploading && <span className="text-[10px] text-gray-400 font-mono animate-pulse">Uploading file...</span>}
                          {fileAttachedName && <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-md">{fileAttachedName}</span>}
                        </div>

                        <button
                          onClick={() => handleHomeworkSubmit(selectedHw.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs cursor-pointer"
                        >
                          Send Submission
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right 1 Col: Class submissions / Admin stats */}
            <div className="space-y-6">
              
              {/* Tutor Grading Drawer */}
              {currentUser.role === "tutor" && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Student Submissions ({associatedSubmissions.length})
                  </h3>

                  {associatedSubmissions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No student submissions yet for this task.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {associatedSubmissions.map((sub) => {
                        const isGradingThis = gradingSubId === sub.id;
                        return (
                          <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-800">{sub.studentName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                sub.status === "graded" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {sub.status === "graded" ? sub.grade : "Pending"}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                              "{sub.content}"
                            </p>

                            {sub.attachments && sub.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                                <FileText className="w-3.5 h-3.5" /> {sub.attachments[0].name}
                              </div>
                            )}

                            {sub.status !== "graded" ? (
                              !isGradingThis ? (
                                <button
                                  onClick={() => {
                                    setGradingSubId(sub.id);
                                    setGradeValue("");
                                    setFeedbackValue("");
                                  }}
                                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] py-1 px-2 rounded-lg font-medium cursor-pointer"
                                >
                                  Evaluate Submission
                                </button>
                              ) : (
                                <div className="space-y-3 border-t border-gray-100 pt-2 mt-2">
                                  {gradingError && <p className="text-[10px] text-rose-500">{gradingError}</p>}
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Assign Grade (e.g. 95/100, A)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 95/100"
                                      value={gradeValue}
                                      onChange={(e) => setGradeValue(e.target.value)}
                                      className="w-full text-xs py-1 px-2 border border-gray-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Feedback & Instructions</label>
                                    <textarea
                                      rows={2}
                                      placeholder="Write critical feedback..."
                                      value={feedbackValue}
                                      onChange={(e) => setFeedbackValue(e.target.value)}
                                      className="w-full text-xs py-1 px-2 border border-gray-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setGradingSubId(null)}
                                      className="text-[10px] text-gray-500 font-medium py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleGradeSubmit(sub.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-md cursor-pointer"
                                    >
                                      Save Grade
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="bg-green-50 border border-green-100 p-2 rounded-lg text-[10px] text-green-800 space-y-1">
                                <p><strong>Grade:</strong> {sub.grade}</p>
                                <p className="italic">"{sub.feedback}"</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSIGN NEW HOMEWORK (Tutors only) */}
        {activeSubTab === "new" && currentUser.role === "tutor" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Create New Homework Assignment</h2>
              <p className="text-xs text-gray-500">Assign curriculum checklists and study parameters to student groups</p>
            </div>

            {assignError && (
              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" /> {assignError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Class Group</label>
                <select
                  value={classGroupId}
                  onChange={(e) => setClassGroupId(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Choose Class Group --</option>
                  {classes.filter(c => c.memberIds.includes(currentUser.id)).map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.subject})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Homework Title</label>
                <input
                  type="text"
                  placeholder="e.g. Polar Coordinate Integration, Essay Thesis Draft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Instructions & Questions</label>
                <textarea
                  rows={4}
                  placeholder="Write clear pedagogical prompts or list questions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Maximum Points Possible</label>
                  <input
                    type="number"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => simulateFileUpload("Calculus_HW_Exercise_Sheets.pdf")}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Syllabus PDF
                </button>
                {uploading && <span className="text-[10px] text-gray-400 font-mono animate-pulse">Uploading...</span>}
                {fileAttachedName && <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-md">{fileAttachedName}</span>}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("assigned")}
                  className="text-xs text-gray-500 hover:text-gray-800 py-2 px-4 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-5 rounded-lg shadow-xs cursor-pointer"
                >
                  Assign to Class
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}