
import React, { useState, useEffect, useRef } from 'react';
import { Building2, Save, Unlock, CheckCircle, PenTool, UserCheck, AlertTriangle, MapPin, Hash, FileText, CalendarClock } from 'lucide-react';
import { Base, Personnel, BaseConfig } from '../../../types';
import { getBases, getPersonnel, getBaseConfig, saveBaseConfig } from '../../../services/dataService';
import { formatJalali } from '../../../utils/dateUtils';

const BaseInfo: React.FC = () => {
  const [bases, setBases] = useState<Base[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [config, setConfig] = useState<Partial<BaseConfig>>({ isLocked: false });
  const [isLoading, setIsLoading] = useState(true);
  
  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const [basesData, personnelData, configData] = await Promise.all([
        getBases(),
        getPersonnel(),
        getBaseConfig('current-user') // Mock user ID
      ]);
      setBases(basesData);
      setPersonnelList(personnelData);
      if (configData) {
        setConfig(configData);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // Canvas Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (config.isLocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || config.isLocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (config.isLocked) return;
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
    }
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clearSignature = () => {
    if (config.isLocked) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Restore signature image if exists
  useEffect(() => {
    if (!isLoading && config.signature && canvasRef.current) {
       const canvas = canvasRef.current;
       const ctx = canvas.getContext('2d');
       const img = new Image();
       img.onload = () => {
         ctx?.drawImage(img, 0, 0);
       };
       img.src = config.signature;
    }
  }, [isLoading, config.signature]);


  const handleSave = async () => {
    if (!config.baseId || !config.supervisorId) {
      alert('لطفا پایگاه و مسئول پایگاه را انتخاب کنید.');
      return;
    }

    // Save Signature
    let signatureData = config.signature;
    if (canvasRef.current && !isCanvasBlank(canvasRef.current)) {
        signatureData = canvasRef.current.toDataURL();
    }

    const newConfig: BaseConfig = {
      id: config.id || Math.random().toString(36),
      baseId: config.baseId,
      supervisorId: config.supervisorId,
      signature: signatureData,
      isLocked: true,
      lastUpdated: new Date().toISOString()
    };

    await saveBaseConfig(newConfig);
    setConfig(newConfig);
    alert('اطلاعات با موفقیت ثبت و قفل شد.');
  };

  const handleUnlock = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید قفل فرم را باز کنید؟')) {
      setConfig((prev) => ({ ...prev, isLocked: false }));
    }
  };

  const isCanvasBlank = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return true;
    const pixelBuffer = new Uint32Array(
      context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
  };

  // Helper to find details
  const selectedBase = bases.find(b => b.id === config.baseId);
  const selectedSupervisor = personnelList.find(p => p.id === config.supervisorId);

  if (isLoading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
           <div>
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Building2 className="text-indigo-600" />
               مشخصات پایگاه
             </h2>
             <p className="text-sm text-slate-500 mt-1">تعیین پایگاه و مسئول مربوطه جهت انجام امور اداری</p>
           </div>
           
           {config.isLocked ? (
             <button onClick={handleUnlock} className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
               <Unlock size={18} />
               <span>ویرایش اطلاعات</span>
             </button>
           ) : (
             <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                <PenTool size={18} />
                <span>در حال ویرایش</span>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Base Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">انتخاب پایگاه</label>
              <select 
                disabled={config.isLocked}
                value={config.baseId || ''}
                onChange={e => setConfig({...config, baseId: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">انتخاب کنید...</option>
                {bases.map(base => (
                  <option key={base.id} value={base.id}>{base.name} - کد: {base.code}</option>
                ))}
              </select>
            </div>

            {selectedBase && (
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3 animate-fadeIn">
                 <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-2 flex items-center gap-2">
                   <FileText size={16} />
                   جزئیات پایگاه (Read Only)
                 </h3>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">نام پایگاه</span>
                      <span className="font-medium text-slate-800 bg-white px-2 py-1 rounded block border border-blue-100">{selectedBase.name}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">کد پایگاه</span>
                      <span className="font-medium text-slate-800 bg-white px-2 py-1 rounded block border border-blue-100 font-mono">{selectedBase.code}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">شماره پایگاه</span>
                      <span className="font-medium text-slate-800 bg-white px-2 py-1 rounded block border border-blue-100">{selectedBase.number}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">نوع پایگاه</span>
                      <span className="font-medium text-slate-800 bg-white px-2 py-1 rounded block border border-blue-100 flex items-center gap-1">
                         <MapPin size={12} className={selectedBase.type === 'urban' ? 'text-blue-500' : 'text-amber-500'}/>
                         {selectedBase.type === 'urban' ? 'شهری' : 'جاده‌ای'}
                      </span>
                    </div>
                 </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">مسئول پایگاه</label>
              {/* Simple Searchable simulation with datalist or just select for now */}
              <select 
                disabled={config.isLocked}
                value={config.supervisorId || ''}
                onChange={e => setConfig({...config, supervisorId: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">جستجو و انتخاب مسئول...</option>
                {personnelList.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.nationalId})</option>
                ))}
              </select>
            </div>

            {selectedSupervisor && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-2">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-indigo-900">{selectedSupervisor.firstName} {selectedSupervisor.lastName}</p>
                        <p className="text-xs text-indigo-600">کد ملی: {selectedSupervisor.nationalId}</p>
                    </div>
                 </div>
                 <div className="mt-1 pt-2 border-t border-indigo-200/50 flex flex-wrap justify-between items-center text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-800">وضعیت:</span>
                      <span className="bg-white px-2 py-0.5 rounded text-indigo-700 border border-indigo-200">
                        {selectedSupervisor.employmentStatus === 'official' ? 'رسمی' : 'طرحی'}
                      </span>
                    </div>
                    {config.isLocked && config.lastUpdated && (
                      <div className="flex items-center gap-1 text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        <CalendarClock size={12} />
                        <span>ثبت: {formatJalali(config.lastUpdated)}</span>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-slate-700 mb-2">امضای دیجیتال مسئول پایگاه</label>
            <div className={`border-2 border-dashed rounded-xl relative bg-white ${config.isLocked ? 'border-slate-300' : 'border-indigo-300 hover:border-indigo-500'}`}>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className={`w-full h-48 touch-none rounded-xl ${config.isLocked ? 'cursor-default' : 'cursor-crosshair'}`}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                 {!config.isLocked && (
                   <div className="absolute top-2 right-2">
                      <button onClick={clearSignature} className="text-xs bg-white shadow-sm border border-slate-200 px-2 py-1 rounded text-red-500 hover:bg-red-50">
                        پاک کردن
                      </button>
                   </div>
                 )}
                 {config.isLocked && (
                   <div className="absolute inset-0 bg-slate-50/20 rounded-xl flex items-center justify-center pointer-events-none">
                      <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-bold text-green-600 border border-green-200 flex items-center gap-1">
                        <CheckCircle size={12} />
                        امضا ثبت شده
                      </div>
                   </div>
                 )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {config.isLocked ? 'جهت تغییر امضا ابتدا قفل فرم را باز کنید.' : 'لطفا امضای خود را در کادر بالا رسم کنید.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        {!config.isLocked && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              ثبت نهایی اطلاعات
            </button>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
         <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="font-bold text-blue-800 text-sm">نکته مهم</h4>
            <p className="text-sm text-blue-600 mt-1 leading-relaxed">
               اطلاعات ثبت شده در این بخش به عنوان سربرگ رسمی در تمامی گزارشات و برنامه‌های شیفت استفاده خواهد شد. لطفا در انتخاب پایگاه و مسئول دقت فرمایید.
            </p>
         </div>
      </div>
    </div>
  );
};

export default BaseInfo;
