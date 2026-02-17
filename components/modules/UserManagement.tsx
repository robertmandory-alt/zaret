
import React, { useState, useEffect } from 'react';
import { User, UserRole, Personnel } from '../../types';
import { getUsers, saveUser, deleteUser, toggleUserStatus, getPersonnel } from '../../services/dataService';
import { ADMIN_MENU_ITEMS, USER_MENU_ITEMS } from '../../constants';
import Modal from '../ui/Modal';
import { Edit, Trash2, UserPlus, CheckCircle, XCircle, Activity, Shield, Key, UserCheck } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [showLogs, setShowLogs] = useState<string | null>(null); // ID of user to show logs for

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [usersData, personnelData] = await Promise.all([getUsers(), getPersonnel()]);
    setUsers(usersData);
    setPersonnelList(personnelData);
  };

  const handleAdd = () => {
    setCurrentUser({ 
      role: UserRole.USER, 
      isActive: true,
      permissions: [] 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | undefined, username: string) => {
    if (!id) {
      alert("شناسه کاربر نامعتبر است.");
      return;
    }

    if (username === 'admin') {
      alert("امکان حذف مدیر سیستم اصلی وجود ندارد.");
      return;
    }

    if (window.confirm(`آیا از حذف کاربر «${username}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
      try {
        await deleteUser(id);
        // Optimistic update for better UI response
        setUsers(users.filter(u => u.id !== id));
        // Ensure sync with server
        await loadData();
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("خطا در حذف کاربر.");
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleUserStatus(id);
    loadData();
  };

  const handlePermissionChange = (moduleId: string, isChecked: boolean) => {
    const currentPermissions = currentUser.permissions || [];
    if (isChecked) {
        setCurrentUser({ ...currentUser, permissions: [...currentPermissions, moduleId] });
    } else {
        setCurrentUser({ ...currentUser, permissions: currentPermissions.filter(p => p !== moduleId) });
    }
  };

  const handlePersonnelSelect = (personnelId: string) => {
    const selectedPerson = personnelList.find(p => p.id === personnelId);
    if (selectedPerson) {
        setCurrentUser({
            ...currentUser,
            personnelId: personnelId,
            fullName: `${selectedPerson.firstName} ${selectedPerson.lastName}`
        });
    } else {
        setCurrentUser({
            ...currentUser,
            personnelId: undefined,
            fullName: ''
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.username && currentUser.personnelId) {
        await saveUser(currentUser as User);
        setIsModalOpen(false);
        loadData();
    } else {
        alert('لطفا پرسنل مربوطه و نام کاربری را انتخاب کنید.');
    }
  };

  // Determine which menu items to show based on selected role
  const roleMenuItems = currentUser.role === UserRole.ADMIN ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-emergency-600" />
            مدیریت کاربران
          </h2>
          <p className="text-sm text-slate-500 mt-1">تعریف و مدیریت دسترسی کاربران سامانه</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-emergency-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emergency-700 transition shadow-lg shadow-emergency-600/20"
        >
          <UserPlus size={18} />
          <span>کاربر جدید</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4">نام پرسنل</th>
                <th className="p-4">نام کاربری</th>
                <th className="p-4">نقش</th>
                <th className="p-4">سطح دسترسی</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                      <UserCheck size={16} className="text-blue-500" />
                      {user.fullName}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{user.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === UserRole.ADMIN ? 'مدیر سیستم' : 'کاربر عادی'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {(user.permissions?.length || 0)} ماژول
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleStatus(user.id!)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        user.isActive 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {user.isActive ? (
                        <><CheckCircle size={12} /> فعال</>
                      ) : (
                        <><XCircle size={12} /> غیرفعال</>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setShowLogs(user.id!)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="گزارش فعالیت">
                        <Activity size={18} />
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="ویرایش">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.username)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                        title="حذف کاربر"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    کاربری یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser.id ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">پرسنل مربوطه</label>
               <select
                 value={currentUser.personnelId || ''}
                 onChange={(e) => handlePersonnelSelect(e.target.value)}
                 className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                 required
               >
                 <option value="">انتخاب پرسنل...</option>
                 {personnelList.map(p => (
                   <option key={p.id} value={p.id}>
                     {p.firstName} {p.lastName} ({p.nationalId})
                   </option>
                 ))}
               </select>
               <p className="text-xs text-slate-400 mt-1">نام و نام خانوادگی به صورت خودکار بر اساس پرسنل انتخاب شده تنظیم می‌شود.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نام و نام خانوادگی (نمایش)</label>
              <input
                type="text"
                value={currentUser.fullName || ''}
                disabled
                className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نام کاربری</label>
              <input
                type="text"
                value={currentUser.username || ''}
                onChange={e => setCurrentUser({...currentUser, username: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور</label>
              <input
                type="text"
                value={currentUser.password || ''}
                onChange={e => setCurrentUser({...currentUser, password: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
                placeholder={currentUser.id ? 'بدون تغییر' : 'رمز عبور را وارد کنید'}
                required={!currentUser.id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نقش کاربری</label>
              <select
                value={currentUser.role}
                onChange={e => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500 outline-none"
              >
                <option value={UserRole.USER}>کاربر عادی</option>
                <option value={UserRole.ADMIN}>مدیر سیستم</option>
              </select>
            </div>
            
            {/* Permissions Section */}
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Key size={16} className="text-slate-400"/>
                سطوح دسترسی ({currentUser.role === UserRole.ADMIN ? 'مدیر سیستم' : 'کاربر عادی'})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {roleMenuItems.filter(item => item.id !== 'dashboard').map((item) => (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer border ${
                      currentUser.permissions?.includes(item.id) 
                      ? 'bg-white border-emergency-200 shadow-sm' 
                      : 'border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={currentUser.permissions?.includes(item.id) || false}
                        onChange={(e) => handlePermissionChange(item.id, e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-emergency-500 checked:bg-emergency-500"
                      />
                      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 select-none">{item.title}</span>
                    </div>
                  </label>
                ))}
                {roleMenuItems.filter(item => item.id !== 'dashboard').length === 0 && (
                  <p className="col-span-2 text-center text-slate-400 text-sm py-2">
                    آیتمی برای نمایش وجود ندارد.
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 pr-1">
                * دسترسی به ماژول «داشبورد» برای تمامی کاربران به صورت پیش‌فرض فعال است.
              </p>
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
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </Modal>

      {/* Activity Logs Modal (Mock) */}
      <Modal
        isOpen={!!showLogs}
        onClose={() => setShowLogs(null)}
        title="گزارش فعالیت کاربر"
      >
         <div className="space-y-4">
            <div className="border-l-2 border-slate-200 pl-4 py-1 ml-2 relative">
               <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
               <p className="text-sm text-slate-800 font-medium">ورود موفق به سیستم</p>
               <span className="text-xs text-slate-500">۱۴۰۲/۱۲/۲۰ - ۱۰:۳۰</span>
            </div>
            <div className="border-l-2 border-slate-200 pl-4 py-1 ml-2 relative">
               <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></div>
               <p className="text-sm text-slate-800 font-medium">مشاهده کارکرد ماهانه</p>
               <span className="text-xs text-slate-500">۱۴۰۲/۱۲/۱۹ - ۱۴:۱۵</span>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
