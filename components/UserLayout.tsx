
import React, { useState } from 'react';
import { Menu, X, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { User, MenuItem } from '../types';
import { USER_MENU_ITEMS, APP_NAME } from '../constants';
import { getTodayJalali } from '../utils/dateUtils';
import BaseInfo from './modules/user/BaseInfo';
import BasePersonnel from './modules/user/BasePersonnel';
import MonthlySchedule from './modules/user/MonthlySchedule';
import UserDashboard from './modules/user/UserDashboard';

interface UserLayoutProps {
  user: User;
  onLogout: () => void;
}

const UserLayout: React.FC<UserLayoutProps> = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('dashboard');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Helper to get active module details
  const activeItem = USER_MENU_ITEMS.find(m => m.id === activeModule);
  const ActiveIcon = activeItem?.icon;

  const renderContent = () => {
    switch (activeModule) {
      case 'base_info':
        return <BaseInfo />;
      case 'base_personnel':
        return <BasePersonnel />;
      case 'schedule':
        return <MonthlySchedule />;
      case 'dashboard':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Sliding Drawer */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-indigo-900 text-white transform transition-transform duration-300 ease-out shadow-2xl flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-indigo-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
               <UserIcon className="text-white" size={24} />
            </div>
            <span className="font-bold text-lg tracking-tight">پنل پرسنل</span>
          </div>
          <button onClick={toggleSidebar} className="text-indigo-300 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {USER_MENU_ITEMS.map((item: MenuItem) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveModule(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${activeModule === item.id 
                      ? 'bg-white text-indigo-900 shadow-lg font-bold' 
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}
                  `}
                >
                  <item.icon size={20} className={activeModule === item.id ? 'text-indigo-600' : 'text-indigo-400 group-hover:text-white'} />
                  <span className="font-medium">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-indigo-800 bg-indigo-950/30">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-800/50">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold border-2 border-indigo-300">
                {user.fullName.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                <p className="text-xs text-indigo-300 truncate">پرسنل اورژانس</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-indigo-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-900 transition-colors"
              title="منو"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{APP_NAME}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">
              {getTodayJalali()}
            </span>
            
            <button className="p-2 relative text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors"
            >
              <span className="text-sm font-medium hidden sm:block">خروج</span>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative">
           <div className="max-w-7xl mx-auto h-full">
              {renderContent()}
           </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
