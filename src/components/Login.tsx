
import React, { useState } from 'react';
import { Lock, HardHat, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          onLogin(user);
        } else {
          setError(true);
          setLoading(false);
        }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Engineering Themed Background with Dark Overlay */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503387762-592dea58ed23?auto=format&fit=crop&q=80&w=1920" 
            alt="Engineering Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-950/95 mix-blend-multiply"></div>
          
          {/* Subtle animated light effects */}
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full filter blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-teal-500/10 rounded-full filter blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="glass-panel p-10 rounded-[2.5rem] shadow-2xl w-full max-w-[460px] text-center animate-scale-in relative z-10 border border-white/20">
        
        {/* Floating Logo Container */}
        <div className="relative mx-auto w-32 h-32 mb-8 animate-float">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-50/50 p-4 transform hover:scale-105 transition-transform">
                <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                    onError={(e) => { 
                        e.currentTarget.src = "/logo.svg";
                        e.currentTarget.onerror = (ev: any) => {
                            (ev.target as HTMLImageElement).style.display = 'none';
                            (ev.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }
                    }} 
                />
                <HardHat size={48} className="text-emerald-600 hidden" />
            </div>
        </div>

        <div className="mb-8 space-y-2 animate-slide-up delay-100">
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight">نظام الموارد البشرية</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">نقابة المهندسين - أسيوط</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-right animate-slide-up delay-200">
          <div className="group">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block mr-2 group-focus-within:text-emerald-600 transition-colors">اسم المستخدم</label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                className="w-full bg-slate-50/80 border border-slate-200 p-4 pr-12 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 font-bold text-emerald-900 placeholder:text-slate-400/80"
                placeholder="أدخل اسم المستخدم"
                autoFocus
              />
              <div className="absolute top-0 right-0 h-full w-12 flex items-center justify-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <User size={20} />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block mr-2 group-focus-within:text-emerald-600 transition-colors">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className="w-full bg-slate-50/80 border border-slate-200 p-4 pr-12 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 font-bold text-emerald-900 placeholder:text-slate-400/80"
                placeholder="••••••••"
              />
              <div className="absolute top-0 right-0 h-full w-12 flex items-center justify-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={20} />
              </div>
            </div>
            {error && (
                <div className="flex items-center gap-2 mt-3 text-red-500 bg-red-50 p-3 rounded-xl text-xs font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    بيانات الدخول غير صحيحة
                </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed btn-interactive overflow-hidden"
          >
            {loading ? (
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>جاري التحقق...</span>
                </div>
            ) : (
                <>
                    دخول للنظام <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-200 animate-slide-up delay-300 text-center">
            <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">جميع الحقوق محفوظة</p>
            <p className="text-sm text-emerald-900 font-extrabold mb-4 bg-emerald-50/80 backdrop-blur py-2 px-4 rounded-xl inline-block border border-emerald-100">
                نقابة المهندسين الفرعية بأسيوط 2026
            </p>
            <div className="pt-2">
                <p className="text-xs font-bold text-emerald-700/80 font-mono">
                    Dev: <span className="text-emerald-900">Eng. Waleed El-Naggar</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
