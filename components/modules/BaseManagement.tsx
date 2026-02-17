
import React, { useState, useEffect } from 'react';
import { Base } from '../../types';
import { getBases, saveBase, deleteBase } from '../../services/dataService';
import Modal from '../ui/Modal';
import { Edit, Trash2, Plus, Building2, MapPin } from 'lucide-react';

const BaseManagement: React.FC = () => {
  const [bases, setBases] = useState<Base[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBase, setCurrentBase] = useState<Partial<Base>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getBases();
    setBases(data);
  };

  const handleAdd = () => {
    setCurrentBase({ type: 'urban' });
    setIsModalOpen(true);
  };

  const handleEdit = (base: Base) => {
    setCurrentBase(base);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این پایگاه اطمینان دارید؟')) {
      await deleteBase(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBase.name && currentBase.code) {
        await saveBase(currentBase as Base);
        setIsModalOpen(false);
        loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-emergency-600" />
            مدیریت پایگاه‌ها
          </h2>
          <p className="text-sm text-slate-500 mt-1">مدیریت اطلاعات پایگاه‌های شهری و جاده‌ای</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-emergency-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emergency-700 transition shadow-md text-sm font-medium"
        >
          <Plus size={18} />
          <span>پایگاه جدید</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4">نام پایگاه</th>
                <th className="p-4">شماره پایگاه</th>
                <th className="p-4">کد پایگاه</th>
                <th className="p-4">نوع</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bases.map((base) => (
                <tr key={base.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-8 rounded-r-md ${base.type === 'urban' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                          {base.name}
                      </div>
                  </td>
                  <td className="p-4 text-slate-600">{base.number}</td>
                  <td className="p-4 text-slate-600 font-mono">{base.code}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${base.type === 'urban' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      <MapPin size={12} />
                      {base.type === 'urban' ? 'شهری' : 'جاده‌ای'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(base)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="ویرایش">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(base.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="حذف">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bases.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                          هیچ پایگاهی ثبت نشده است.
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
        title={currentBase.id ? 'ویرایش پایگاه' : 'ثبت پایگاه جدید'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">نام پایگاه</label>
              <input
                type="text"
                value={currentBase.name || ''}
                onChange={e => setCurrentBase({...currentBase, name: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نوع پایگاه</label>
              <select
                value={currentBase.type}
                onChange={e => setCurrentBase({...currentBase, type: e.target.value as any})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
              >
                <option value="urban">شهری</option>
                <option value="road">جاده‌ای</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">شماره پایگاه</label>
              <input
                type="text"
                value={currentBase.number || ''}
                onChange={e => setCurrentBase({...currentBase, number: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
              />
            </div>
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">کد پایگاه</label>
              <input
                type="text"
                value={currentBase.code || ''}
                onChange={e => setCurrentBase({...currentBase, code: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none font-mono text-left"
                required
              />
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

export default BaseManagement;
