import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { LogOut, Save, User as UserIcon, Shield, Loader2, Copy, Check, ArrowLeft, Bell, Palette, Lock, UserCog, X } from "lucide-react";
import { User as AppUser } from "../types";
import { Menu } from "lucide-react";

export default function ProfileTab({ onLogout, onBack, currentUser }: { onLogout: () => void, onBack?: () => void, currentUser: AppUser }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    role: string;
    student_id: string;
    photo_url: string;
    email: string;
  } | null>(null);
  
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 1024);
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "notifications" | "theme" | "privacy">("profile");

  useEffect(() => {
    fetchProfile();
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        role: data.role || "student",
        student_id: data.student_id || "",
        photo_url: data.photo_url || data.avatar_url || "",
        email: data.email || user.email || "",
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          student_id: profile.student_id,
          photo_url: profile.photo_url,
          avatar_url: profile.photo_url,
        })
        .eq("id", user.id);

      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = async () => {
    await supabase.auth.signOut({ scope: "local" });
    onLogout();
  };

  if (loading) {
    return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load profile data.</p>
          <button onClick={onBack} className="text-blue-500 hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "profile", label: "Edit Profile", icon: UserCog },
    { id: "security", label: "Change Password", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "theme", label: "Theme Settings", icon: Palette },
    { id: "privacy", label: "Privacy Settings", icon: Lock },
  ] as const;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar for Settings Navigation */}
        <div className={`w-full ${isMenuOpen ? "lg:w-64" : "lg:w-auto"} shrink-0 space-y-6 transition-all`}>
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-white rounded-full shadow-sm"
                    title="Go Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 aspect-square p-0 flex items-center justify-center shrink-0 text-slate-600 bg-white border border-gray-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Current User Summary */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 items-center gap-4 ${isMenuOpen ? "flex" : "hidden"}`}>
              <div className="relative shrink-0">
                <img 
                  src={profile.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + " " + profile.last_name)}&background=random`} 
                  alt="Profile" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                 loading="lazy" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} />
                <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-[2px] border-white ${
                  currentUser.isOnline ? "bg-emerald-500" : "bg-slate-300"
                }`} title={currentUser.isOnline ? "Online" : "Offline"} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{profile.first_name} {profile.last_name}</h3>
                <p className="text-xs text-slate-500 capitalize">{profile.role === 'tutor' ? 'Instructor' : 'Student'}</p>
                {profile.student_id && <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">ID: {profile.student_id}</p>}
              </div>
            </div>
            
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 ${isMenuOpen ? "block" : "hidden"}`}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id as any);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeSection === section.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <section.icon className={`w-5 h-5 ${activeSection === section.id ? "text-blue-600" : "text-slate-400"}`} />
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors cursor-pointer shadow-sm ${isMenuOpen ? "flex" : "hidden"}`}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Right Content Area */}
        <div className={`flex-1 min-w-0 bg-white border border-gray-100 shadow-sm rounded-3xl p-6 lg:p-10 min-h-[600px] ${isMenuOpen ? "hidden lg:block" : "block"}`}>
          {activeSection === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500 mt-1">Update your personal details and public profile.</p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Preview & URL */}
                <div className="flex items-start sm:items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="shrink-0 relative">
                    <img 
                      src={profile.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + " " + profile.last_name)}&background=random`} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                     loading="lazy" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} />
                    <span className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-[3px] border-white ${
                      currentUser.isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`} title={currentUser.isOnline ? "Online" : "Offline"} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Profile Photo</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingImage(true);
                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `avatar_${Date.now()}.${fileExt}`;
                              const { data, error } = await supabase.storage.from('attachments').upload(fileName, file);
                              if (error) throw error;
                              const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(fileName);
                              setProfile({ ...profile, photo_url: urlData.publicUrl });
                            } catch (err) {
                              console.error("Upload error:", err);
                              alert("Failed to upload image");
                            } finally {
                              setUploadingImage(false);
                            }
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploadingImage && <div className="text-xs text-blue-500 mt-2 font-medium">Uploading image...</div>}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Role</label>
                    <select
                      value={profile.role}
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none appearance-none cursor-not-allowed font-medium"
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{profile.role === 'tutor' ? 'Tutor ID' : 'Student ID'}</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={profile.student_id || ""}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-500 cursor-not-allowed font-mono"
                        placeholder="N/A (Older account)"
                      />
                      <button
                        type="button"
                        title="Copy ID"
                        onClick={() => {
                          if (profile.student_id) {
                            navigator.clipboard.writeText(profile.student_id);
                            setCopiedId(true);
                            setTimeout(() => setCopiedId(false), 2000);
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">Email address cannot be changed.</p>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security & Password</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your password and security preferences.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-700">Password updates are managed externally</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Please check your email provider or contact an administrator to reset your password.</p>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mt-1">Choose what you want to be notified about.</p>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive daily summaries of unread messages.", active: true },
                  { title: "Push Notifications", desc: "Get notified immediately when someone mentions you.", active: false },
                  { title: "New Assignment Alerts", desc: "Notify me when a tutor posts new homework.", active: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${item.active ? "bg-blue-500" : "bg-slate-200"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.active ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "theme" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-500 mt-1">Customize how the app looks on your device.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-blue-500 bg-blue-50 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-12 bg-white rounded shadow-sm border border-slate-200" />
                  <span className="text-sm font-semibold text-blue-700">Light Mode</span>
                </button>
                <button className="p-4 border border-slate-200 hover:border-slate-300 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors">
                  <div className="w-16 h-12 bg-[#0a0e17] rounded shadow-sm border border-slate-800" />
                  <span className="text-sm font-semibold text-slate-700">Dark Mode</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage who can see your activity and information.</p>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Show Online Status", desc: "Let others see when you are active.", active: true },
                  { title: "Read Receipts", desc: "Let others know when you have read their messages.", active: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${item.active ? "bg-blue-500" : "bg-slate-200"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.active ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}