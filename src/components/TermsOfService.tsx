import React from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo-small.png" alt="EduMessenger Logo" className="w-8 h-8 object-contain"  loading="eager" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E"; }} />
            <span className="text-lg font-display font-bold tracking-tight text-white">Terms of Service</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-slate-400 mb-12">Effective Date: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using EduMessenger, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              EduMessenger provides a digital workspace for educational purposes, including messaging, file sharing, homework tracking, and video calls between verified tutors and students.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. User Conduct</h2>
            <p>
              You agree to use the service only for lawful educational purposes. You must not:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Use the service to transmit any harmful, threatening, or abusive content.</li>
              <li>Impersonate any person or entity, including a tutor or administrator.</li>
              <li>Interfere with or disrupt the integrity or performance of the platform.</li>
              <li>Attempt to gain unauthorized access to other users' accounts or data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Intellectual Property</h2>
            <p>
              The platform and its original content, features, and functionality are owned by EduMessenger Inc. Users retain ownership of any content or study materials they upload or share on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">5. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
