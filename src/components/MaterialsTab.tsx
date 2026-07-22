import React, { useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, FileText, Upload, Calendar, Search, Trash2, Download, CheckCircle, Plus } from "lucide-react";
import { StudyMaterial, ClassGroup, User, Attachment } from "../types";

interface MaterialsTabProps {
  currentUser: User;
  studyMaterials: StudyMaterial[];
  classes: ClassGroup[];
  onUploadMaterial: (payload: { classGroupId: string; title: string; description?: string; attachment: Attachment }) => void;
  onDeleteMaterial?: (materialId: string) => void;
}

export default function MaterialsTab({
  currentUser,
  studyMaterials,
  classes,
  onUploadMaterial
}: MaterialsTabProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [classGroupId, setClassGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileAttachedName, setFileAttachedName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const simulateFileUpload = (fileName: string) => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFileAttachedName(fileName);
    }, 1000);
  };

  const simulateDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert("File downloaded securely to local downloads!");
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classGroupId || !title || !fileAttachedName) {
      setUploadError("Please choose a class, provide a title, and attach a file.");
      return;
    }

    const classGroup = classes.find(c => c.id === classGroupId);
    
    onUploadMaterial({
      classGroupId,
      title,
      description,
      attachment: {
        id: "att_mat_" + Date.now(),
        name: fileAttachedName,
        type: fileAttachedName.endsWith(".pdf") ? "pdf" : "doc",
        url: "#",
        size: "1.4 MB"
      }
    });

    // Reset Form
    setClassGroupId("");
    setTitle("");
    setDescription("");
    setFileAttachedName("");
    setUploadError("");
    setShowUploadForm(false);
  };

  // Filter study materials based on query and class matching
  const myClassIds = classes.filter(c => c.memberIds.includes(currentUser.id)).map(c => c.id);
  const filteredMaterials = studyMaterials.filter(m => {
    if (!myClassIds.includes(m.classGroupId)) return false;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.classGroupName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-600" />
          <h1 className="text-base font-semibold text-gray-900">Shared Study Workspace</h1>
        </div>

        {currentUser.role === "tutor" && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </button>
        )}
      </div>

      <div className="p-4 md:p-6 overflow-y-auto flex-1 max-w-5xl w-full mx-auto space-y-6">
        
        {/* UPLOAD MATERIAL FORM (Tutors only) */}
        {showUploadForm && currentUser.role === "tutor" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs max-w-lg mx-auto space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Upload Shared Study Material</h2>
              <p className="text-xs text-gray-500 font-medium font-sans">Share cheatsheets, textbooks, or formulas directly with the class</p>
            </div>

            {uploadError && (
              <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Limits Formulas Cheat Sheet, Hamlet Study Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="What is this document? e.g. formulas sheet for midterm review..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => simulateFileUpload("Class_Study_Reference_Notes.pdf")}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Select PDF / DOC File
                </button>
                {uploading && <span className="text-[10px] text-gray-400 font-mono animate-pulse">Uploading file...</span>}
                {fileAttachedName && <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-md">{fileAttachedName}</span>}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 py-2 px-4 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-5 rounded-lg shadow-xs cursor-pointer"
                >
                  Share with Class
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIBRARY BROWSER PANEL */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-700">Course Materials Library</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 pl-9 pr-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-xs text-gray-500 text-xs">
              No shared documents found matches your selection.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((mat) => (
                <div key={mat.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                        {mat.classGroupName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" /> {new Date(mat.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h3 className="text-xs font-semibold text-gray-900 truncate max-w-44" title={mat.title}>{mat.title}</h3>
                        <p className="text-[10px] text-gray-500 font-medium line-clamp-2 leading-tight">{mat.description || "No description provided."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-50 mt-4 pt-4 flex items-center justify-between">
                    <div className="text-left font-mono">
                      <p className="text-[10px] text-gray-700 font-semibold">{mat.attachment.name}</p>
                      <p className="text-[8px] text-gray-400">{mat.attachment.size}</p>
                    </div>

                    <button
                      onClick={() => simulateDownload(mat.id)}
                      disabled={downloadingId !== null}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all cursor-pointer"
                    >
                      {downloadingId === mat.id ? (
                        <span className="text-[8px] font-bold font-mono animate-pulse">Sync...</span>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}