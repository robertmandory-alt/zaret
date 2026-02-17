import React, { useState } from 'react';
import { Ambulance, User, Lock, AlertCircle, Activity } from 'lucide-react';
import { login } from '../services/authService';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('لطفا نام کاربری و رمز عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است.');
      }
    } catch (err) {
      console.error(err);
      setError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emergency-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-4xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden z-10 flex flex-col md:flex-row">
        
        {/* Left Side (Graphical) */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-20">
              {/* Decorative graphical elements */}
               <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad1)" />
                 <defs>
                   <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" style={{stopColor:'rgb(220, 38, 38)', stopOpacity:1}} />
                     <stop offset="100%" style={{stopColor:'rgb(37, 99, 235)', stopOpacity:1}} />
                   </linearGradient>
                 </defs>
               </svg>
           </div>
           
           <div className="relative z-10">
             <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Activity className="text-white" size={32} />
             </div>
             <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
               سامانه جامع مدیریت<br/>عملکرد <span className="text-emergency-500">اورژانس</span>
             </h2>
             <p className="text-slate-300 text-sm leading-relaxed opacity-90">
               مدیریت هوشمند شیفت‌ها، پایش دقیق عملکرد پرسنل و گزارش‌گیری پیشرفته جهت ارتقای کیفیت خدمات اورژانس کشور.
             </p>
           </div>

           <div className="relative z-10 mt-12">
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
               <div className="w-12 h-12 rounded-full bg-emergency-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emergency-600/40">
                 115
               </div>
               <div>
                 <p className="text-white text-sm font-bold">پشتیبانی ۲۴ ساعته</p>
                 <p className="text-slate-400 text-xs">همیشه در دسترس برای خدمت</p>
               </div>
             </div>
           </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8 md:hidden">
             <Ambulance className="mx-auto text-emergency-600 mb-2" size={48} />
             <h1 className="text-2xl font-bold text-slate-800">ورود به سامانه</h1>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'signin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ورود به حساب
            </button>
            <button 
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ثبت نام
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نام کاربری</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-emergency-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleInputChange(setUsername, e.target.value)}
                    className="block w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emergency-500/20 focus:border-emergency-500 transition-all duration-200"
                    placeholder="نام کاربری خود را وارد کنید"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رمز عبور</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-focus-within:text-emergency-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => handleInputChange(setPassword, e.target.value)}
                    className="block w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emergency-500/20 focus:border-emergency-500 transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm animate-shake">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emergency-600/20 text-sm font-medium text-white bg-emergency-600 hover:bg-emergency-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emergency-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'ورود به سیستم'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <User size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">ثبت نام پرسنل جدید</h3>
              <p className="text-slate-500 text-sm mb-6">
                برای ثبت نام در سامانه، لطفا به مسئول پایگاه خود مراجعه نمایید تا دسترسی‌های لازم برای شما ایجاد گردد.
              </p>
              <button 
                onClick={() => setActiveTab('signin')}
                className="text-emergency-600 font-medium hover:text-emergency-700 text-sm"
              >
                بازگشت به ورود
              </button>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              نسخه ۱.۰.۰ | توسعه و طراحی واحد فناوری اطلاعات
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
