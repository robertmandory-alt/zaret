
import React, { useState, useEffect } from 'react';
import { Shift } from '../../types';
import { getShifts, saveShift, deleteShift } from '../../services/dataService';
import Modal from '../ui/Modal';
import { Edit, Trash2, Plus, CalendarClock, Clock } from 'lucide-react';

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getShifts();
    setShifts(data);
  };

  const handleAdd = () => {
    setCurrentShift({ hours: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setCurrentShift(shift);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این شیفت اطمینان دارید؟')) {
      await deleteShift(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentShift.title && currentShift.code) {
        await saveShift(currentShift as Shift);
        setIsModalOpen(false);
        loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarClock className="text-emergency-600" />
            مدیریت شیفت‌های کاری
          </h2>
          <p className="text-sm text-slate-500 mt-1">تعریف انواع شیفت و ساعات معادل</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-emergency-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emergency-700 transition shadow-md text-sm font-medium"
        >
          <Plus size={18} />
          <span>شیفت جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => (
            <div key={shift.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start mb-3">
                   <div>
                       <h3 className="font-bold text-slate-800 text-lg">{shift.title}</h3>
                       <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">کد: {shift.code}</span>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(shift)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(shift.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <Clock size={18} className="text-blue-500" />
                    <span className="font-medium">{shift.hours}</span>
                    <span className="text-sm text-slate-500">ساعت معادل کارکرد</span>
                </div>
            </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentShift.id ? 'ویرایش نوع شیفت' : 'تعریف شیفت جدید'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">عنوان شیفت</label>
              <input
                type="text"
                value={currentShift.title || ''}
                onChange={e => setCurrentShift({...currentShift, title: e.target.value})}
                placeholder="مثال: شیفت ۲۴ ساعته تعطیل"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">کد شیفت</label>
                <input
                    type="text"
                    value={currentShift.code || ''}
                    onChange={e => setCurrentShift({...currentShift, code: e.target.value})}
                    placeholder="مثال: 273"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none font-mono text-left"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ساعت معادل</label>
                <input
                    type="number"
                    value={currentShift.hours || ''}
                    onChange={e => setCurrentShift({...currentShift, hours: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none text-left"
                    required
                />
                </div>
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

export default ShiftManagement;
