
import React, { useState, useEffect } from 'react';
import { Building2, UserCheck, Shield, AlertTriangle, PenTool, Calendar, MapPin, Hash, Barcode, CalendarClock } from 'lucide-react';
import { BaseConfig, Base, Personnel } from '../../../types';
import { getBaseConfig, getBaseById, getPersonnelById } from '../../../services/dataService';
import { getTodayJalali, formatJalali } from '../../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const [config, setConfig] = useState<BaseConfig | null>(null);
  const [baseDetails, setBaseDetails] = useState<Base | null>(null);
  const [supervisorDetails, setSupervisorDetails] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const conf = await getBaseConfig('current-user');
        setConfig(conf);

        if (conf) {
          if (conf.baseId) {
            const base = await getBaseById(conf.baseId);
            setBaseDetails(base || null);
          }
          if (conf.supervisorId) {
            const supervisor = await getPersonnelById(conf.supervisorId);
            setSupervisorDetails(supervisor || null);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">در حال دریافت اطلاعات...</div>;
  }

  // If no base is configured yet
  if (!config || !baseDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle className="text-amber-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">اطلاعات پایگاه ثبت نشده است</h2>
        <p className="text-slate-500 max-w-md mb-8">
          برای دسترسی به امکانات سامانه، لطفا ابتدا از منوی «مشخصات پایگاه»، اطلاعات پایگاه و مسئول مربوطه را تکمیل نمایید.
        </p>
        <button 
           onClick={() => navigate('/base-info')}
           className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition font-medium"
        >
          لطفا از منوی سمت راست، گزینه «مشخصات پایگاه» را انتخاب کنید
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">خوش آمدید، {supervisorDetails ? supervisorDetails.lastName : 'همکار گرامی'}</h1>
          <p className="text-indigo-100 flex items-center gap-2">
            <Calendar size={16} />
            امروز: {getTodayJalali()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Base Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500 rounded-r-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="text-blue-500" />
                مشخصات پایگاه
              </h2>
              <p className="text-xs text-slate-400 mt-1">اطلاعات ثبت شده در سیستم</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
               {baseDetails.code}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
             <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                 <Building2 size={16} />
               </div>
               <div>
                 <span className="block text-xs text-slate-400">نام پایگاه</span>
                 <span className="font-medium text-slate-800">{baseDetails.name}</span>
               </div>
             </div>

             <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                 <MapPin size={16} />
               </div>
               <div>
                 <span className="block text-xs text-slate-400">نوع پایگاه</span>
                 <span className="font-medium text-slate-800">
                    {baseDetails.type === 'urban' ? 'شهری' : 'جاده‌ای'}
                 </span>
               </div>
             </div>

             <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                 <Hash size={16} />
               </div>
               <div>
                 <span className="block text-xs text-slate-400">شماره پایگاه</span>
                 <span className="font-medium text-slate-800">{baseDetails.number}</span>
               </div>
             </div>

             <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                 <Barcode size={16} />
               </div>
               <div>
                 <span className="block text-xs text-slate-400">کد سیستمی</span>
                 <span className="font-medium text-slate-800 font-mono">{baseDetails.code}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Supervisor Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500 rounded-r-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="text-indigo-500" />
                مشخصات مسئول
              </h2>
              <p className="text-xs text-slate-400 mt-1">سرپرست تایید شده پایگاه</p>
            </div>
            {config.isLocked && (
               <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <Shield size={12} />
                  تایید شده
               </div>
            )}
          </div>

          <div className="space-y-4">
             {supervisorDetails ? (
               <>
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm border border-slate-200">
                       {supervisorDetails.lastName.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800 text-lg">
                          {supervisorDetails.firstName} {supervisorDetails.lastName}
                       </h3>
                       <p className="text-slate-500 text-sm flex items-center gap-2">
                         کد ملی: <span className="font-mono">{supervisorDetails.nationalId}</span>
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-slate-500">وضعیت استخدامی:</span>
                    <span className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                       {supervisorDetails.employmentStatus === 'official' ? 'رسمی' : 'طرحی'}
                    </span>
                 </div>

                 {config.lastUpdated && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                        <span className="text-sm text-slate-500">تاریخ ثبت اطلاعات:</span>
                        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                           <CalendarClock size={14} className="text-slate-400" />
                           {formatJalali(config.lastUpdated)}
                        </div>
                    </div>
                 )}
                 
                 {config.signature && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                       <p className="text-xs text-slate-400 mb-2">نمونه امضای دیجیتال:</p>
                       <div className="h-16 w-full border border-dashed border-slate-300 rounded-lg bg-slate-50/50 flex items-center justify-center overflow-hidden">
                          <img src={config.signature} alt="Signature" className="max-h-full max-w-full opacity-80 mix-blend-multiply" />
                       </div>
                    </div>
                 )}
               </>
             ) : (
                <div className="text-red-500 text-sm">اطلاعات مسئول یافت نشد.</div>
             )}
          </div>
        </div>
      </div>

      {/* Quick Stats or Status (Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
               <Shield size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs">وضعیت برنامه</p>
               <p className="font-bold text-slate-800">فعال</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
               <PenTool size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs">گزارشات ماهانه</p>
               <p className="font-bold text-slate-800">در انتظار تکمیل</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
               <UserCheck size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs">پرسنل فعال</p>
               <p className="font-bold text-slate-800">-- نفر</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default UserDashboard;
