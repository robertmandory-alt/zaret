
import React, { useState, useEffect } from 'react';
import { Personnel } from '../../types';
import { getPersonnel, savePersonnel, deletePersonnel } from '../../services/dataService';
import Modal from '../ui/Modal';
import { Edit, Trash2, UserPlus, BriefcaseMedical, Search } from 'lucide-react';

const PersonnelManagement: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Partial<Personnel>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getPersonnel();
    setPersonnel(data);
  };

  const handleAdd = () => {
    setCurrentPerson({
        employmentStatus: 'official',
        productivityStatus: 'productive',
        driverStatus: 'non-driver',
        workExperience: '0-4'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (person: Personnel) => {
    setCurrentPerson(person);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این پرسنل اطمینان دارید؟')) {
      await deletePersonnel(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPerson.firstName && currentPerson.lastName && currentPerson.nationalId) {
        await savePersonnel(currentPerson as Personnel);
        setIsModalOpen(false);
        loadData();
    }
  };

  const filteredPersonnel = personnel.filter(p => 
    p.lastName.includes(searchTerm) || 
    p.nationalId.includes(searchTerm) ||
    p.firstName.includes(searchTerm)
  );

  const getWorkExperienceLabel = (value?: string) => {
      switch(value) {
          case '0-4': return '۰ تا ۴ سال';
          case '4-8': return '۴ تا ۸ سال';
          case '8-12': return '۸ تا ۱۲ سال';
          case '12-16': return '۱۲ تا ۱۶ سال';
          case '16+': return '۱۶ سال به بالا';
          default: return '-';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BriefcaseMedical className="text-emergency-600" />
            مدیریت پرسنل
          </h2>
          <p className="text-sm text-slate-500 mt-1">بانک اطلاعاتی جامع پرسنل اورژانس</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="جستجو (نام، کدملی)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emergency-500 text-sm w-64"
                />
             </div>
            <button 
              onClick={handleAdd}
              className="bg-emergency-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emergency-700 transition shadow-md text-sm font-medium"
            >
              <UserPlus size={18} />
              <span>پرسنل جدید</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4">نام و نام خانوادگی</th>
                <th className="p-4">کد ملی</th>
                <th className="p-4">سابقه کاری</th>
                <th className="p-4">وضعیت استخدام</th>
                <th className="p-4">وضعیت بهره‌وری</th>
                <th className="p-4">وضعیت رانندگی</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{person.firstName} {person.lastName}</td>
                  <td className="p-4 text-slate-600 font-mono">{person.nationalId}</td>
                  <td className="p-4 text-slate-700 text-sm">{getWorkExperienceLabel(person.workExperience)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${person.employmentStatus === 'official' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {person.employmentStatus === 'official' ? 'رسمی' : 'طرحی'}
                    </span>
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${person.productivityStatus === 'productive' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {person.productivityStatus === 'productive' ? 'بهره‌ور' : 'غیر بهره‌ور'}
                    </span>
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${person.driverStatus === 'driver' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {person.driverStatus === 'driver' ? 'راننده' : 'غیر راننده'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(person)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="ویرایش">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(person.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="حذف">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPersonnel.length === 0 && (
                  <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                          موردی یافت نشد.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPerson.id ? 'ویرایش مشخصات پرسنل' : 'ثبت پرسنل جدید'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نام</label>
              <input
                type="text"
                value={currentPerson.firstName || ''}
                onChange={e => setCurrentPerson({...currentPerson, firstName: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نام خانوادگی</label>
              <input
                type="text"
                value={currentPerson.lastName || ''}
                onChange={e => setCurrentPerson({...currentPerson, lastName: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">کد ملی</label>
              <input
                type="text"
                value={currentPerson.nationalId || ''}
                onChange={e => setCurrentPerson({...currentPerson, nationalId: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">سابقه کاری</label>
              <select
                value={currentPerson.workExperience}
                onChange={e => setCurrentPerson({...currentPerson, workExperience: e.target.value as any})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
              >
                <option value="0-4">۰ تا ۴ سال</option>
                <option value="4-8">۴ تا ۸ سال</option>
                <option value="8-12">۸ تا ۱۲ سال</option>
                <option value="12-16">۱۲ تا ۱۶ سال</option>
                <option value="16+">۱۶ سال به بالا</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">وضعیت استخدام</label>
              <select
                value={currentPerson.employmentStatus}
                onChange={e => setCurrentPerson({...currentPerson, employmentStatus: e.target.value as any})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
              >
                <option value="official">رسمی</option>
                <option value="contractual">طرحی</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">وضعیت بهره‌وری</label>
              <select
                value={currentPerson.productivityStatus}
                onChange={e => setCurrentPerson({...currentPerson, productivityStatus: e.target.value as any})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
              >
                <option value="productive">بهره‌ور</option>
                <option value="non-productive">غیر بهره‌ور</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">وضعیت رانندگی</label>
              <select
                value={currentPerson.driverStatus}
                onChange={e => setCurrentPerson({...currentPerson, driverStatus: e.target.value as any})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
              >
                <option value="non-driver">غیر راننده</option>
                <option value="driver">راننده</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emergency-600 text-white rounded-lg hover:bg-emergency-700 transition shadow-md"
            >
              ذخیره
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PersonnelManagement;