import { OptimizedImage } from "@/components/ui/OptimizedImage";

import React, { useState } from "react";
import SEO from "./SEO";
import { generateOrganizationSchema } from "../lib/structuredData";

import { MessageSquare, Shield, BookOpen, Users, Video, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onHelpClick: () => void;
}

export default function LandingPage({ onLoginClick, onSignUpClick, onPrivacyClick, onTermsClick, onHelpClick }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const featuresList = [
    {
      title: "Rich Messaging",
      image: "/featurechat.png",
      subtitle: "Send text, voice notes, and attachments seamlessly.",
      details: "Experience real-time chat with typing indicators, read receipts, rich reactions, thread replies, and organized group conversations. Keep your academic discussions focused and separated from personal chats."
    },
    {
      title: "Homework Tracking",
      image: "/featurehomework.png",
      subtitle: "Assign and track tasks directly in the app.",
      details: "Streamline your workflow with assignment posting, submission tracking, automated deadlines, review status updates, and direct tutor feedback. Automatic organization keeps everyone accountable and on track."
    },
    {
      title: "File & Media Sharing",
      image: "/featurefiles.png",
      subtitle: "Share documents and media right in your class groups.",
      details: "Seamlessly exchange photos, videos, and documents with instant previews, progress upload status, and organized media handling. Everything is neatly categorized in the shared materials tab for quick access."
    },
    {
      title: "Secure & Private",
      image: "/featureprivate.png",
      subtitle: "Ensure your private conversations and data are safe.",
      details: "Built on private tutor-owned classes with invitation-only access, robust role-based permissions, and protected data. Optional end-to-end encryption ensures that your assignments, grades, and chats remain exclusively yours."
    }
  ];


  return (
    <>
      <SEO 
        title="EduChat | The Best Tutor Chat & Student-Tutor Messenger"
        description="EduChat is a secure educational chat app for teacher-student communication. Features include class chat, group study collaboration, and a dedicated tutor dashboard."
        url="https://yourdomain.com/"
        jsonLd={generateOrganizationSchema()}
      />
    <main className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OptimizedImage src="/logo.png" width={200} height={80} alt="EduMessenger Logo" className="hidden md:block h-20 w-auto bg-transparent" objectFit="contain" priority />
            <OptimizedImage src="/logo-small.png" width={100} height={100} alt="EduMessenger Logo" className="md:hidden h-16 w-auto bg-transparent" objectFit="contain" priority />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <button onClick={onHelpClick} className="hover:text-black transition-colors cursor-pointer">Help Center</button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-black transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button 
              onClick={onSignUpClick}
              className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>The New Standard in EdTech</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
            The ultimate <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">educational chat app</span> for student-tutor messaging.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            A secure student-tutor communication platform designed for education. Combine an intuitive tutor messenger, class chat, study collaboration, and seamless homework management in one tutor chat app.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={onSignUpClick}
              className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-base font-bold rounded-2xl transition-all flex items-center justify-center cursor-pointer"
            >
              Log into account
            </button>
          </div>
          
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> End-to-end encrypted
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free for students
            </div>
          </div>
        </div>

        <div className="flex-1 relative z-10 w-full max-w-lg lg:max-w-none">
          <div className="relative shadow-2xl shadow-black/5 flex items-center justify-center overflow-hidden rounded-3xl bg-gray-50 border border-gray-200 p-0">
            <OptimizedImage src="/hero.png" width={1200} height={800} alt="EduMessenger Hero" className="w-full h-auto bg-transparent" objectFit="cover" priority />
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Built from the ground up for modern educational workflows.</p>
          </div>
          
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresList.map((feature, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveFeature(activeFeature === idx ? null : idx)}
                className={`bg-white border p-6 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col group ${activeFeature === idx ? 'border-blue-500 shadow-md ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
              >
                <div className="bg-gray-50 rounded-2xl mb-6 aspect-video overflow-hidden border border-gray-100 relative p-0 flex items-center justify-center">
                  <OptimizedImage src={feature.image} alt={feature.title} className="w-full h-full group-hover:scale-105 transition-transform duration-500 bg-transparent" objectFit="cover" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.subtitle}
                </p>
                
                <div className={`mt-auto overflow-hidden transition-all duration-500 ease-in-out ${activeFeature === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-4 mt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-3xl">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {feature.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section for SEO */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about our educational chat app.</p>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What makes this the best tutor messenger?</h3>
              <p className="text-gray-600">EduChat is designed specifically for education. Unlike generic messaging apps, our teacher-student messenger includes a tutor dashboard, homework tracking, and secure classroom messaging built-in.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Is this a secure student tutor messaging platform?</h3>
              <p className="text-gray-600">Yes, we prioritize safety. Our secure education chat app features end-to-end encryption for private messages and robust role-based access for group study collaboration.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I use this for class chat and group study?</h3>
              <p className="text-gray-600">Absolutely. The app features dedicated spaces for class chat, allowing students to collaborate on assignments while tutors manage the conversation through their centralized dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <OptimizedImage src="/logo-small.png" width={100} height={100} alt="EduMessenger Logo" className="h-10 w-auto bg-transparent" objectFit="contain" />
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-gray-500">
            <button onClick={onPrivacyClick} className="hover:text-black transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={onTermsClick} className="hover:text-black transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={onHelpClick} className="hover:text-black transition-colors cursor-pointer">Help Center</button>
            <a href="mailto:tutorchat.contect@proton.me" className="hover:text-black transition-colors cursor-pointer">tutorchat.contect@proton.me</a>
          </div>
          <p className="text-sm text-slate-600">&copy; {new Date().getFullYear()} EduMessenger Inc. All rights reserved.</p>
        </div>
      </footer>
    </main>
    </>
  );
}
