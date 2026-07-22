import React from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo-small.png" alt="EduMessenger Logo" className="w-8 h-8 object-contain"  loading="eager" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} />
            <span className="text-lg font-display font-bold tracking-tight text-white">Privacy Policy</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to EduMessenger. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identity Data:</strong> First name, last name, username.</li>
              <li><strong>Contact Data:</strong> Email address.</li>
              <li><strong>Profile Data:</strong> Your role (tutor/student), subjects, bio, and settings.</li>
              <li><strong>Content Data:</strong> Messages, files, and homework submissions you share within the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. How We Use Your Data</h2>
            <p>
              We use your data to provide and improve the EduMessenger platform, including connecting you with tutors and students, facilitating communications, and maintaining a secure educational environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We offer end-to-end encryption features for direct messages and voice/video calls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@edumessenger.example.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
