import React, { useState } from "react";
import { Search, ChevronRight, FileText, Settings, Video, ArrowLeft, Loader2, CheckCircle2, MessageSquare } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function HelpCenter({ onBack }: Props) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Support Form State
  const [supportName, setSupportName] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [supportError, setSupportError] = useState("");

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportStatus('loading');
    setSupportError("");
    
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName,
          email: supportEmail,
          subject: supportSubject,
          message: supportMessage
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSupportStatus('success');
      } else {
        setSupportStatus('error');
        setSupportError(data.error || "Failed to send message.");
      }
    } catch (err: any) {
      setSupportStatus('error');
      setSupportError("Network error. Please try again later.");
    }
  };


  const categories = [
    {
      id: "messaging",
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      title: "Messaging & Chats",
      description: "Learn how to send messages, attachments, and use direct chats.",
      content: (
        <div className="space-y-6 text-slate-300">
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">Direct Messaging</h3>
            <p className="leading-relaxed mb-4">
              EduMessenger supports instant one-on-one and group messaging. To start a chat, select a contact from the left sidebar or use the "+ Add Contact" button to invite a new student or tutor via email.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">Sharing Attachments</h3>
            <p className="leading-relaxed mb-4">
              You can easily share images, videos, and study documents directly in the chat. Click the paperclip icon next to the message input field to select a file from your device. All shared files are organized in the right panel under "Shared Media & Files".
            </p>
          </section>
        </div>
      )
    },
    {
      id: "video",
      icon: <Video className="w-6 h-6 text-purple-400" />,
      title: "Video & Voice Calls",
      description: "Troubleshoot camera/microphone issues and group call features.",
      content: (
        <div className="space-y-6 text-slate-300">
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">Starting a Call</h3>
            <p className="leading-relaxed mb-4">
              You can initiate a high-quality video or voice call by clicking the camera icon located at the top right of any active chat window. Calls are end-to-end encrypted by default to protect your privacy.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">Troubleshooting Audio/Video</h3>
            <p className="leading-relaxed mb-4">
              If your camera or microphone is not working:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Ensure you have granted browser permissions for camera and microphone access.</li>
                <li>Check your device settings to make sure the correct input devices are selected.</li>
                <li>Try refreshing the page or restarting your browser.</li>
              </ul>
            </p>
          </section>
        </div>
      )
    },
    {
      id: "homework",
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
      title: "Homework & Grades",
      description: "Guides for students submitting work and tutors grading it.",
      content: (
        <div className="space-y-6 text-slate-300">
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">For Tutors: Assigning Homework</h3>
            <p className="leading-relaxed mb-4">
              Navigate to the "Homework Center" tab within your class workspace. Click "Create Assignment" to set a title, description, and deadline. You can also attach reference documents. Only tutors have permission to create and grade assignments.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">For Students: Submitting Work</h3>
            <p className="leading-relaxed mb-4">
              To submit your homework, open the specific assignment in the Homework Center and click "Submit". You can upload your completed files and add a text description. Once graded by your tutor, your grade and feedback will appear directly on the assignment card.
            </p>
          </section>
        </div>
      )
    },
    {
      id: "settings",
      icon: <Settings className="w-6 h-6 text-slate-400" />,
      title: "Account Settings",
      description: "Manage your profile, subjects, theme, and security preferences.",
      content: (
        <div className="space-y-6 text-slate-300">
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">Updating Your Profile</h3>
            <p className="leading-relaxed mb-4">
              Click your profile avatar in the bottom left of the screen to access your Settings. Here you can update your biography, subjects taught, and adjust your hourly rates (if applicable).
            </p>
          </section>
          <section>
            <h3 className="text-xl font-display font-bold text-white mb-3">Privacy & Security</h3>
            <p className="leading-relaxed mb-4">
              In the settings panel, you can toggle End-to-End Encryption (E2EE) and manage read receipts. We recommend keeping E2EE enabled for maximum security of your academic data and conversations.
            </p>
          </section>
        </div>
      )
    }
  ];

  const activeData = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <button 
            onClick={() => activeCategory ? setActiveCategory(null) : onBack()} 
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo-small.png" alt="EduMessenger Logo" className="w-8 h-8 object-contain" loading="eager" />
            <span className="text-lg font-display font-bold tracking-tight text-white">
              {activeCategory ? "Help Article" : "Help Center"}
            </span>
          </div>
        </div>
      </nav>

            <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        {activeCategory === null ? (
          <>
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">How can we help you?</h1>
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search for articles, guides, or questions..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className="p-6 rounded-3xl bg-[#0a0e17] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group flex gap-4 items-start"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{cat.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors mt-3" />
                </div>
              ))}
            </div>

            <div className="bg-linear-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-8 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-white mb-3">Still need help?</h2>
              <p className="text-blue-200 mb-6">Our support team is available around the clock to assist you with any technical issues or account questions.</p>
              <button 
                onClick={() => {
                  setActiveCategory('support');
                  setSupportStatus('idle');
                  setSupportName('');
                  setSupportSubject('');
                  setSupportEmail('');
                  setSupportMessage('');
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-500/25"
              >
                Contact Support
              </button>
            </div>
          </>
        ) : activeCategory === 'support' ? (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setActiveCategory(null)}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Help Center
            </button>
            <div className="bg-[#0a0e17] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-display font-bold text-white mb-2">Contact Support</h2>
                <p className="text-slate-400 mb-6 text-sm">Our support team usually replies within 24 hours. You can also reach us directly at <a href="mailto:tutorchat.contect@proton.me" className="text-blue-400 hover:underline">tutorchat.contect@proton.me</a></p>
                {supportStatus === 'success' ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-emerald-200">Your message has been sent. Our support team will respond within 24 hours.</p>
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Return to Help Center
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-4 text-left">
                    {supportStatus === 'error' && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm">
                        {supportError}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                        <input
                          type="text"
                          required
                          value={supportName}
                          onChange={e => setSupportName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={e => setSupportEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                    <div className="mt-4 mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
                      <input
                        type="text"
                        required
                        value={supportSubject}
                        onChange={e => setSupportSubject(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
                        placeholder="What is this regarding?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">How can we help?</label>
                      <textarea
                        required
                        value={supportMessage}
                        onChange={e => setSupportMessage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 min-h-[120px] resize-y"
                        placeholder="Describe your issue or question..."
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setActiveCategory(null)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={supportStatus === 'loading'}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
                      >
                        {supportStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        Send Message
                      </button>
                    </div>
                  </form>
                )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setActiveCategory(null)}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Help Center
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                {activeData?.icon}
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white">{activeData?.title}</h1>
                <p className="text-slate-400 mt-2">{activeData?.description}</p>
              </div>
            </div>
            <div className="bg-[#0a0e17] border border-white/5 rounded-3xl p-8 shadow-xl">
              {activeData?.content}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
