
import React, { useState, useEffect } from 'react';
import { CalendarDays, Save, Download, Plus, AlertCircle, CheckCircle, X, Info, Truck, ShieldAlert } from 'lucide-react';
import { Personnel, BaseConfig, Shift, MonthlyRoster, RosterRow } from '../../../types';
import { getBaseConfig, getBasePersonnel, getShifts, getRoster, saveRoster, getPersonnel } from '../../../services/dataService';
import Modal from '../../ui/Modal';

// Validation Result Type
interface DayValidation {
  day: number;
  isValid: boolean;
  messages: { text: string; type: 'error' | 'warning' }[];
  missingShifts: string[];
}

const MonthlySchedule: React.FC = () => {
  const [baseConfig, setBaseConfig] = useState<BaseConfig | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]); // Base personnel
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]); // For guest selection
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const [year, setYear] = useState(1404);
  const [month, setMonth] = useState(9); // Default to Azar (9) as requested
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
  
  const [rosterData, setRosterData] = useState<RosterRow[]>([]);
  const [validations, setValidations] = useState<DayValidation[]>([]);
  const [rosterId, setRosterId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  
  // Modal State
  const [selectedCell, setSelectedCell] = useState<{rowIndex: number, day: number} | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const config = await getBaseConfig('current-user');
      setBaseConfig(config);
      
      const shiftsData = await getShifts();
      setShifts(shiftsData);
      
      const allP = await getPersonnel();
      setAllPersonnel(allP);

      if (config) {
        const baseP = await getBasePersonnel(config.baseId);
        setPersonnel(baseP);
        loadRoster(config.baseId, year, month, baseP);
      }
    };
    init();
  }, []);

  // Reload roster when parameters change
  useEffect(() => {
    if (baseConfig) {
      loadRoster(baseConfig.baseId, year, month, personnel);
      setShowValidation(false); // Reset validation visibility on month change
    }
  }, [year, month, personnel]); 

  // Calculate Days in Month (Simple Jalali Logic)
  useEffect(() => {
    const count = month <= 6 ? 31 : 30; // Simplified
    setDaysInMonth(Array.from({ length: count }, (_, i) => i + 1));
  }, [month, year]);

  const loadRoster = async (baseId: string, y: number, m: number, baseP: Personnel[]) => {
    const existingRoster = await getRoster(baseId, y, m);
    
    if (existingRoster) {
      setRosterId(existingRoster.id);
      const mergedRows = [...existingRoster.rows];
      
      baseP.forEach(p => {
        if (!mergedRows.find(r => r.personnelId === p.id)) {
          mergedRows.push({
            personnelId: p.id,
            isGuest: false,
            shifts: {}
          });
        }
      });
      setRosterData(mergedRows);
    } else {
      setRosterId(null);
      const initialRows: RosterRow[] = baseP.map(p => ({
        personnelId: p.id,
        isGuest: false,
        shifts: {}
      }));
      setRosterData(initialRows);
    }
  };

  // --- Logic & Validation ---

  useEffect(() => {
    validateSchedule();
  }, [rosterData, daysInMonth, shifts]);

  const getShiftCoverage = (shiftCode: string) => {
    // Returns coverage for [Morning, Evening, Night]
    // 1 means covers, 0 means not
    const code = shiftCode?.toUpperCase();
    if (code === '24H' || code === '273') return [1, 1, 1];
    if (code === 'L' || code === 'LD') return [1, 1, 0];
    if (code === 'N') return [0, 0, 1];
    if (code === 'M') return [1, 0, 0];
    if (code === 'E') return [0, 1, 0];
    return [0, 0, 0];
  };

  const validateSchedule = () => {
    const newValidations: DayValidation[] = daysInMonth.map(day => {
      // Aggregators for [Morning, Evening, Night]
      const totalPresence = [0, 0, 0];
      const driverPresence = [0, 0, 0];

      rosterData.forEach(row => {
        const shiftId = row.shifts[day];
        const shift = shifts.find(s => s.id === shiftId);
        if (!shift) return;

        const person = allPersonnel.find(p => p.id === row.personnelId) || personnel.find(p => p.id === row.personnelId);
        if (!person) return;

        const coverage = getShiftCoverage(shift.code);
        const isDriver = person.driverStatus === 'driver';

        for (let i = 0; i < 3; i++) {
          if (coverage[i]) {
            totalPresence[i]++;
            if (isDriver) driverPresence[i]++;
          }
        }
      });

      const messages: { text: string; type: 'error' | 'warning' }[] = [];
      const missingShifts: string[] = [];

      // Check Minimum 2 Personnel
      const deficit = [
        Math.max(0, 2 - totalPresence[0]), // Morning Deficit
        Math.max(0, 2 - totalPresence[1]), // Evening Deficit
        Math.max(0, 2 - totalPresence[2])  // Night Deficit
      ];

      // Check Minimum 1 Driver
      const driverDeficit = [
        Math.max(0, 1 - driverPresence[0]),
        Math.max(0, 1 - driverPresence[1]),
        Math.max(0, 1 - driverPresence[2])
      ];

      // Analyze Needs
      // Strategy: Try to fill gaps with largest shifts first (24h > Long > Night/Morning)
      
      let mNeed = deficit[0];
      let eNeed = deficit[1];
      let nNeed = deficit[2];
      
      // Drivers needed flag for the respective slots
      let mDriverNeed = driverDeficit[0] > 0;
      let eDriverNeed = driverDeficit[1] > 0;
      let nDriverNeed = driverDeficit[2] > 0;

      const suggestions: string[] = [];

      // Loop to fill needs
      while (mNeed > 0 || eNeed > 0 || nNeed > 0) {
        let addedType = '';
        let needsDriver = false;

        if (mNeed > 0 && eNeed > 0 && nNeed > 0) {
          // Suggest 24h
          addedType = '24';
          needsDriver = mDriverNeed || eDriverNeed || nDriverNeed;
          mNeed--; eNeed--; nNeed--;
          if (needsDriver) { mDriverNeed=false; eDriverNeed=false; nDriverNeed=false; }
        } else if (mNeed > 0 && eNeed > 0) {
          // Suggest Long
          addedType = 'LD';
          needsDriver = mDriverNeed || eDriverNeed;
          mNeed--; eNeed--;
          if (needsDriver) { mDriverNeed=false; eDriverNeed=false; }
        } else if (nNeed > 0) {
          // Suggest Night
          addedType = 'N';
          needsDriver = nDriverNeed;
          nNeed--;
          if (needsDriver) { nDriverNeed=false; }
        } else if (mNeed > 0) {
           addedType = 'M';
           needsDriver = mDriverNeed;
           mNeed--;
           if (needsDriver) mDriverNeed=false;
        } else if (eNeed > 0) {
           addedType = 'E';
           needsDriver = eDriverNeed;
           eNeed--;
           if (needsDriver) eDriverNeed=false;
        } else {
            // Failsafe
            break;
        }

        const driverText = needsDriver ? 'راننده' : 'غیر راننده';
        suggestions.push(`${addedType} ${driverText}`);
      }

      // Check if we have filled personnel needs but still lack drivers in existing shifts?
      // (This edge case is rare if we prioritize driver assignment, but let's check)
      if (suggestions.length === 0 && (mDriverNeed || eDriverNeed || nDriverNeed)) {
         if (mDriverNeed && eDriverNeed && nDriverNeed) suggestions.push('24 راننده (جایگزین)');
         else if (mDriverNeed && eDriverNeed) suggestions.push('LD راننده (جایگزین)');
         else if (nDriverNeed) suggestions.push('N راننده (جایگزین)');
      }

      if (suggestions.length > 0) {
         missingShifts.push(...suggestions);
         messages.push({ text: `نیاز: ${suggestions.join(' + ')}`, type: 'error' });
      }

      return {
        day,
        isValid: messages.length === 0,
        messages,
        missingShifts
      };
    });
    setValidations(newValidations);
  };

  // --- Handlers ---

  const handleCellClick = (rowIndex: number, day: number) => {
    setSelectedCell({ rowIndex, day });
    setIsShiftModalOpen(true);
  };

  const handleShiftSelect = (shiftId: string) => {
    if (selectedCell) {
      const updatedRoster = [...rosterData];
      updatedRoster[selectedCell.rowIndex].shifts[selectedCell.day] = shiftId;
      setRosterData(updatedRoster);
      setIsShiftModalOpen(false);
    }
  };

  const handleAddGuest = (guestId: string) => {
    if (rosterData.find(r => r.personnelId === guestId)) {
      alert('این نیرو قبلا اضافه شده است.');
      return;
    }
    const newRow: RosterRow = {
      personnelId: guestId,
      isGuest: true,
      shifts: {}
    };
    setRosterData([...rosterData, newRow]);
    setIsGuestModalOpen(false);
  };

  const handleSave = async (status: 'draft' | 'final') => {
    if (!baseConfig) return;
    
    // Trigger Validation Display
    setShowValidation(true);

    if (status === 'final') {
      const hasErrors = validations.some(v => !v.isValid);
      if (hasErrors) {
        if (!window.confirm('برنامه دارای خطاهای تحلیل وضعیت است. آیا مایل به ارسال نهایی هستید؟')) {
          return;
        }
      }
    }

    const roster: MonthlyRoster = {
      id: rosterId || Math.random().toString(36),
      baseId: baseConfig.baseId,
      year,
      month,
      rows: rosterData,
      status
    };

    await saveRoster(roster);
    setRosterId(roster.id);
    alert(status === 'draft' 
        ? 'ذخیره موقت انجام شد. تحلیل وضعیت در پایین جدول نمایش داده شد.' 
        : 'برنامه نهایی شد و برای مدیر ارسال گردید.');
  };

  const getPersonDetails = (id: string) => {
    return allPersonnel.find(p => p.id === id) || personnel.find(p => p.id === id);
  };

  const getShiftDetails = (id: string | null) => {
    return shifts.find(s => s.id === id);
  };

  const getMonthName = (m: number) => {
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    return months[m-1] || '';
  }

  if (!baseConfig) return <div className="p-8 text-center text-slate-500">لطفا ابتدا مشخصات پایگاه را تکمیل کنید.</div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Controls Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-indigo-800 font-bold text-lg">
              <CalendarDays />
              <h2>برنامه شیفت‌ها</h2>
           </div>
           <div className="flex gap-2">
             <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm outline-none">
               {[1402, 1403, 1404, 1405].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
             <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm outline-none w-32">
               {['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m, i) => (
                 <option key={i} value={i+1}>{m}</option>
               ))}
             </select>
           </div>
           <button onClick={() => loadRoster(baseConfig.baseId, year, month, personnel)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
             نمایش جدول
           </button>
        </div>

        <div className="flex gap-2">
           <button onClick={() => setIsGuestModalOpen(true)} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
             <Plus size={16} />
             افزودن مهمان
           </button>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-100 text-slate-600 sticky top-0 z-20 shadow-sm">
              {/* TABLE TITLE ROW */}
              <tr>
                 <th colSpan={daysInMonth.length + 1} className="p-3 bg-indigo-50/50 text-indigo-900 border-b border-indigo-100">
                    <h3 className="text-center font-bold text-lg">
                       برنامه ماه {getMonthName(month)} سال {year}
                    </h3>
                 </th>
              </tr>
              <tr>
                <th className="p-3 border-b border-r border-slate-200 min-w-[220px] sticky right-0 bg-slate-100 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">مشخصات پرسنل</th>
                {daysInMonth.map(day => (
                  <th key={day} className="p-2 border-b border-r border-slate-200 min-w-[60px] font-medium text-sm">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rosterData.map((row, rIndex) => {
                const person = getPersonDetails(row.personnelId);
                return (
                  <tr key={row.personnelId} className="hover:bg-slate-50 transition-colors">
                    {/* Sticky Name Column + Specifications */}
                    <td className="p-3 border-b border-r border-slate-200 sticky right-0 bg-white z-10 text-right shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                       <div className="flex flex-col gap-1.5">
                         <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                                {person ? `${person.firstName} ${person.lastName}` : 'ناشناس'}
                            </span>
                            {row.isGuest && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">مهمان</span>}
                         </div>
                         
                         {/* Specifications under name */}
                         <div className="flex flex-wrap gap-1 mt-1">
                            {person?.driverStatus === 'driver' ? (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-0.5"><Truck size={10} />راننده</span>
                            ) : (
                                <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">غیر راننده</span>
                            )}
                            
                            {person?.productivityStatus === 'productive' ? (
                                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">بهره‌ور</span>
                            ) : (
                                <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">غیر بهره‌ور</span>
                            )}
                         </div>
                       </div>
                    </td>
                    
                    {/* Days Cells */}
                    {daysInMonth.map(day => {
                      const shiftId = row.shifts[day];
                      const shift = getShiftDetails(shiftId);
                      return (
                        <td 
                          key={day} 
                          onClick={() => handleCellClick(rIndex, day)}
                          className="p-1 border-b border-r border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors h-16"
                        >
                          {shift ? (
                            <div className={`w-full h-full rounded-md flex items-center justify-center text-xs font-bold shadow-sm ${shift.color || 'bg-gray-100'}`}>
                              {shift.code}
                            </div>
                          ) : (
                            <div className="w-full h-full"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            
            {/* Validation Footer */}
            <tfoot className="sticky bottom-0 z-20 bg-slate-50 font-bold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
               <tr>
                 <td className="p-3 border-t border-r border-slate-300 sticky right-0 bg-slate-100 z-30 text-right text-sm">
                   تحلیل وضعیت
                 </td>
                 {showValidation ? (
                    // Show Analysis Results
                    validations.map(val => (
                       <td 
                         key={val.day} 
                         className={`p-1 border-t border-r border-slate-300 text-center relative group cursor-help align-top ${val.isValid ? 'bg-green-50' : 'bg-red-50'}`}
                       >
                         <div className="flex flex-col items-center justify-center h-full gap-1 py-1">
                           {val.isValid ? (
                             <CheckCircle size={18} className="text-green-600" />
                           ) : (
                             <>
                               <ShieldAlert size={18} className="text-red-500 animate-pulse" />
                               <div className="flex flex-col gap-1 w-full px-1">
                                  {val.missingShifts.map((req, idx) => (
                                    <span key={idx} className="text-[9px] leading-tight bg-red-100 text-red-700 px-1 py-0.5 rounded border border-red-200 block w-full whitespace-nowrap overflow-hidden text-ellipsis">
                                      {req}
                                    </span>
                                  ))}
                               </div>
                             </>
                           )}
                         </div>
                         
                         {/* Detailed Tooltip */}
                         {!val.isValid && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[150px] bg-slate-800 text-white text-[11px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-normal leading-relaxed text-right">
                              <div className="font-bold border-b border-slate-600 pb-1 mb-1 text-center text-red-300">نیازهای روز {val.day}</div>
                              {val.messages.map((m, i) => (
                                <div key={i} className="flex items-start gap-1 mb-1 last:mb-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                                  <span>{m.text}</span>
                                </div>
                              ))}
                           </div>
                         )}
                       </td>
                    ))
                 ) : (
                    // Show Placeholder (Gray)
                    <td colSpan={daysInMonth.length} className="p-3 text-center text-slate-400 text-xs font-normal border-t border-slate-300">
                       <div className="flex items-center justify-center gap-2">
                          <Info size={16} />
                          <span>برای مشاهده تحلیل وضعیت روزانه و کمبودها، دکمه «ذخیره موقت» را بزنید.</span>
                       </div>
                    </td>
                 )}
               </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
         <div className="flex gap-2">
            <button onClick={() => alert('دانلود فایل PDF')} className="flex items-center gap-2 text-slate-600 bg-slate-100 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition">
              <Download size={16} />
              PDF
            </button>
            <button onClick={() => alert('دانلود فایل اکسل')} className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg text-sm hover:bg-green-100 transition">
              <Download size={16} />
              Excel
            </button>
         </div>
         <div className="flex gap-3">
            <button onClick={() => handleSave('draft')} className="text-indigo-600 border border-indigo-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
              ذخیره موقت
            </button>
            <button onClick={() => handleSave('final')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 flex items-center gap-2">
              <Save size={16} />
              ثبت نهایی و ارسال
            </button>
         </div>
      </div>

      {/* Shift Selection Modal */}
      <Modal
         isOpen={isShiftModalOpen}
         onClose={() => setIsShiftModalOpen(false)}
         title={`انتخاب شیفت - روز ${selectedCell?.day}`}
      >
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shifts.map(shift => (
               <button
                 key={shift.id}
                 onClick={() => handleShiftSelect(shift.id)}
                 className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition hover:scale-105 active:scale-95 ${shift.color} border-transparent hover:shadow-md`}
               >
                  <span className="text-2xl font-bold">{shift.code}</span>
                  <span className="text-xs opacity-75">{shift.title}</span>
               </button>
            ))}
            <button
               onClick={() => handleShiftSelect(null as any)}
               className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 flex flex-col items-center gap-2 transition hover:bg-slate-100"
            >
               <X size={32} />
               <span className="text-xs">حذف شیفت</span>
            </button>
         </div>
      </Modal>

      {/* Guest Modal */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title="افزودن نیروی مهمان"
      >
        <div className="max-h-96 overflow-y-auto">
          {allPersonnel.filter(p => !rosterData.some(r => r.personnelId === p.id)).map(p => (
            <div key={p.id} onClick={() => handleAddGuest(p.id)} className="flex justify-between items-center p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 transition">
               <div>
                  <div className="font-bold text-slate-800">{p.firstName} {p.lastName}</div>
                  <div className="text-xs text-slate-500">{p.nationalId} | {p.employmentStatus === 'official' ? 'رسمی' : 'طرحی'}</div>
               </div>
               <Plus size={18} className="text-indigo-600" />
            </div>
          ))}
          {allPersonnel.filter(p => !rosterData.some(r => r.personnelId === p.id)).length === 0 && (
            <p className="text-center text-slate-500 py-4">همه نیروها در جدول موجود هستند.</p>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default MonthlySchedule;
