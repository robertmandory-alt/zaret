
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Trash2, ShieldCheck, Truck, Briefcase } from 'lucide-react';
import { Personnel, BaseConfig } from '../../../types';
import { getPersonnel, getBasePersonnel, addPersonnelToBase, removePersonnelFromBase, getBaseConfig } from '../../../services/dataService';

const BasePersonnel: React.FC = () => {
  const [baseId, setBaseId] = useState<string | null>(null);
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [myPersonnel, setMyPersonnel] = useState<Personnel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Personnel[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const init = async () => {
      const config = await getBaseConfig('current-user');
      if (config && config.baseId) {
        setBaseId(config.baseId);
        refreshMyPersonnel(config.baseId);
      }
      const all = await getPersonnel();
      setAllPersonnel(all);
    };
    init();
  }, []);

  const refreshMyPersonnel = async (id: string) => {
    const list = await getBasePersonnel(id);
    setMyPersonnel(list);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Filter personnel who are NOT already in my base
    const myIds = myPersonnel.map(p => p.id);
    const results = allPersonnel.filter(p => 
      !myIds.includes(p.id) && 
      (p.lastName.includes(query) || p.firstName.includes(query) || p.nationalId.includes(query))
    );
    setSearchResults(results);
  };

  const handleAdd = async (person: Personnel) => {
    if (!baseId) return;
    await addPersonnelToBase(baseId, person.id);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    refreshMyPersonnel(baseId);
  };

  const handleRemove = async (personId: string) => {
    if (!baseId) return;
    if (window.confirm('آیا از حذف این پرسنل از لیست پایگاه اطمینان دارید؟')) {
      await removePersonnelFromBase(baseId, personId);
      refreshMyPersonnel(baseId);
    }
  };

  if (!baseId) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-500">لطفا ابتدا در بخش «مشخصات پایگاه»، پایگاه خود را انتخاب و ثبت نمایید.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" />
              پرسنل پایگاه
            </h2>
            <p className="text-sm text-slate-500 mt-1">مدیریت لیست پرسنل ثابت پایگاه جهت برنامه‌ریزی شیفت‌ها</p>
         </div>
         <button 
           onClick={() => setShowSearch(!showSearch)}
           className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shadow-sm ${showSearch ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
         >
           <UserPlus size={18} />
           <span>{showSearch ? 'بستن افزودن' : 'افزودن پرسنل'}</span>
         </button>
      </div>

      {/* Add Personnel Section */}
      {showSearch && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-fadeIn">
           <div className="relative max-w-lg mx-auto">
              <input 
                type="text"
                placeholder="جستجو بر اساس نام یا کدملی..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
              />
              <Search className="absolute right-4 top-3.5 text-indigo-400" size={20} />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-indigo-100 overflow-hidden z-10 max-h-60 overflow-y-auto">
                   {searchResults.map(p => (
                     <div key={p.id} className="p-3 hover:bg-indigo-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition cursor-pointer" onClick={() => handleAdd(p)}>
                        <div>
                           <p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                           <p className="text-xs text-slate-500">{p.nationalId} | {p.employmentStatus === 'official' ? 'رسمی' : 'طرحی'}</p>
                        </div>
                        <button className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">
                          افزودن +
                        </button>
                     </div>
                   ))}
                </div>
              )}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                 <div className="text-center text-sm text-indigo-400 mt-2">موردی یافت نشد.</div>
              )}
           </div>
        </div>
      )}

      {/* Personnel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myPersonnel.map(person => (
           <div key={person.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition group relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                      {person.lastName.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">{person.firstName} {person.lastName}</h3>
                       <p className="text-xs text-slate-500 mb-1">{person.nationalId}</p>
                       <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${person.employmentStatus === 'official' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          <Briefcase size={10} />
                          {person.employmentStatus === 'official' ? 'رسمی' : 'طرحی'}
                       </span>
                    </div>
                 </div>
                 <button onClick={() => handleRemove(person.id)} className="text-slate-300 hover:text-red-500 transition p-1">
                    <Trash2 size={18} />
                 </button>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                 <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${person.productivityStatus === 'productive' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    <ShieldCheck size={12} />
                    {person.productivityStatus === 'productive' ? 'بهره‌ور' : 'غیر بهره‌ور'}
                 </span>
                 <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${person.driverStatus === 'driver' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Truck size={12} />
                    {person.driverStatus === 'driver' ? 'راننده' : 'غیر راننده'}
                 </span>
              </div>
           </div>
        ))}
        
        {myPersonnel.length === 0 && !showSearch && (
           <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users className="mx-auto mb-2 opacity-50" size={32} />
              <p>لیست پرسنل پایگاه خالی است.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default BasePersonnel;
