
import React, { useState } from 'react';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { User, MenuItem } from '../types';
import { ADMIN_MENU_ITEMS, APP_NAME } from '../constants';
import { getTodayJalali } from '../utils/dateUtils';

// Import Modules
import UserManagement from './modules/UserManagement';
import PersonnelManagement from './modules/PersonnelManagement';
import ShiftManagement from './modules/ShiftManagement';
import BaseManagement from './modules/BaseManagement';

interface AdminLayoutProps {
  user: User;
  onLogout: () => void;
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('dashboard');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Helper to get active module details
  const activeItem = ADMIN_MENU_ITEMS.find(m => m.id === activeModule);
  const ActiveIcon = activeItem?.icon;

  const renderContent = () => {
    switch (activeModule) {
      case 'users':
        return <UserManagement />;
      case 'personnel':
        return <PersonnelManagement />;
      case 'shifts':
        return <ShiftManagement />;
      case 'bases':
        return <BaseManagement />;
      case 'dashboard':
      default:
        return (
          <div className="grid gap-6">
             <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-dashed border-gray-300 h-96 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                   {ActiveIcon && <ActiveIcon size={40} className="text-blue-500" />}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {activeModule === 'dashboard' ? 'داشبورد مدیریتی' : `ماژول ${activeItem?.title}`}
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  {activeModule === 'dashboard' 
                    ? 'به سامانه جامع مدیریت عملکرد اورژانس خوش آمدید. برای شروع از منوی سمت راست یکی از ماژول‌ها را انتخاب کنید.' 
                    : 'این بخش در حال توسعه است. به زودی تمامی امکانات مربوطه در اینجا قرار خواهد گرفت.'}
                </p>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* Sidebar Overlay (Backdrop) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sliding Sidebar Navigation */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-out shadow-2xl flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emergency-600 rounded-lg flex items-center justify-center shadow-lg shadow-emergency-500/30">
              <span className="text-xl font-bold">EMS</span>
            </div>
            <span className="font-bold text-lg tracking-tight">پنل مدیریت</span>
          </div>
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {ADMIN_MENU_ITEMS.map((item: MenuItem) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveModule(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${activeModule === item.id 
                      ? 'bg-emergency-600 text-white shadow-lg shadow-emergency-600/20' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon size={20} className={activeModule === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                  <span className="font-medium">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {user.fullName.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                <p className="text-xs text-slate-400 truncate">مدیر کل</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="منو"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{APP_NAME}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {getTodayJalali()}
            </span>
            
            <button className="p-2 relative text-slate-500 hover:text-emergency-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-emergency-600 transition-colors"
            >
              <span className="text-sm font-medium hidden sm:block">خروج</span>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 relative">
           <div className="max-w-7xl mx-auto">
              {renderContent()}
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
