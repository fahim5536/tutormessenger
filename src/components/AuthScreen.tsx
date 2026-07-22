import { OptimizedImage } from "@/components/ui/OptimizedImage";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { logEvent } from "../lib/analytics";

interface AuthScreenProps {
  onLoginSuccess: (userDoc: any) => void;
  error?: string | null;
  initialMode?: "login" | "signup";
  onBack?: () => void;
}

export default function AuthScreen({ onLoginSuccess, error: externalError, initialMode = "login", onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"tutor" | "student">("student");
  
  const [internalError, setInternalError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const error = externalError || internalError;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email) throw new Error("Please enter your email address.");
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage("Password reset email sent. Please check your inbox.");
        setIsForgotPassword(false);
      } else if (isLogin) {
        if (!email || !password) throw new Error("Please enter email and password.");
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (!data.user) throw new Error("Login failed");

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        if (profileData) {
          onLoginSuccess({ 
            id: data.user.id, 
            name: `${profileData.first_name} ${profileData.last_name}`, 
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            ...profileData 
          });
        } else {
          // Fallback if missing
          onLoginSuccess({ id: data.user.id, name: email.split('@')[0], email: email, role: "student" });
        }
      } else {
        if (!email || !password || !firstName || !lastName) throw new Error("Please fill in all fields.");
        
        let studentId = "";
        if (role === "student") {
          studentId = "STU-" + Math.floor(100000 + Math.random() * 900000).toString();
        } else if (role === "tutor") {
          studentId = "TUT-" + Math.floor(100000 + Math.random() * 900000).toString();
        }
        const photoUrl = "";

        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role,
              student_id: studentId,
              photo_url: photoUrl,
            },
          },
        });
        
        if (error) throw error;
        if (!data.user) throw new Error("Registration failed");
        logEvent("Auth", "Signup");
        setMessage("Registration successful! Please check your email to verify your account before logging in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      setInternalError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-8">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-linear-to-b from-[#030712]/50 via-[#030712]/80 to-[#030712]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer z-50 bg-gray-100/50 md:bg-transparent rounded-full backdrop-blur-md md:backdrop-blur-none"
          >
            &larr; Back
          </button>
        )}
        
        {/* Left side: Illustration */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 relative">
          <div className="absolute top-8 right-8 hidden md:block opacity-20">
            <OptimizedImage src="/logo-small.png" alt="EduMessenger Logo" className="w-12 h-12 filter invert bg-transparent" objectFit="contain" priority />
          </div>
          <div className="w-full max-w-md relative flex items-center justify-center p-6 bg-gray-50/80 rounded-[2rem] border border-gray-100 shadow-sm">
            <OptimizedImage src="/loginillustration.png" alt="Welcome to EduMessenger" className="w-full h-auto mix-blend-multiply drop-shadow-xs bg-transparent" objectFit="contain" priority />
          </div>
        </div>

        {/* Right side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
               <OptimizedImage src="/logo.png" alt="EduMessenger Logo" className="hidden md:block h-20 w-auto bg-transparent" objectFit="contain" priority />
               <OptimizedImage src="/logo-small.png" alt="EduMessenger Logo" className="md:hidden h-16 w-auto bg-transparent" objectFit="contain" priority />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-2 tracking-tight">
            {isForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
          </h1>
          <p className="text-sm text-gray-500">
            {isForgotPassword 
              ? "Enter your email to receive a password reset link." 
              : (isLogin ? "Sign in to continue to your workspace." : "Register for a new account (Gmail only).")}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-600 flex items-center gap-2">
            <span className="w-1 h-4 bg-rose-500 rounded-full block" />
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full block" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="John"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Role</label>
              <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${role === "student" ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700 cursor-pointer"}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("tutor")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${role === "tutor" ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700 cursor-pointer"}`}
                >
                  Tutor
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Gmail Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
              placeholder="name@gmail.com"
              required
            />
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setInternalError(null); setMessage(null); }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer mt-4 active:scale-[0.98]"
          >
            {loading ? "Please wait..." : (isForgotPassword ? "Send Reset Link" : (isLogin ? "Sign In" : "Register"))}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          {isForgotPassword ? (
            <button
              onClick={() => { setIsForgotPassword(false); setInternalError(null); setMessage(null); }}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          ) : (
            <p className="text-xs text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setInternalError(null); setMessage(null); }}
                className="text-black hover:text-blue-600 font-semibold transition-colors cursor-pointer ml-1"
              >
                {isLogin ? "Create one now" : "Sign in instead"}
              </button>
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
