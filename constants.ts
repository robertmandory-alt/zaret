
import { UserRole, MenuItem } from './types';
import { 
  Users, 
  BriefcaseMedical, 
  CalendarClock, 
  Building2, 
  Activity, 
  LayoutDashboard,
  CalendarDays,
  Fuel,
  GraduationCap,
  Mail,
  FileText,
  ClipboardList
} from 'lucide-react';

// Mock Credentials
export const MOCK_CREDENTIALS = {
  [UserRole.ADMIN]: {
    username: 'admin',
    password: 'admin1',
  },
  [UserRole.USER]: {
    username: 'ems',
    password: '1234',
  },
};

export const APP_NAME = "سامانه جامع عملکرد پرسنل اورژانس";

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'داشبورد',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    id: 'users',
    title: 'مدیریت کاربران',
    icon: Users,
    path: '/users',
  },
  {
    id: 'personnel',
    title: 'مدیریت پرسنل',
    icon: BriefcaseMedical,
    path: '/personnel',
  },
  {
    id: 'shifts',
    title: 'مدیریت شیفت‌های کاری',
    icon: CalendarClock,
    path: '/shifts',
  },
  {
    id: 'bases',
    title: 'مدیریت پایگاه‌ها',
    icon: Building2,
    path: '/bases',
  },
  {
    id: 'schedule',
    title: 'برنامه ماهانه',
    icon: CalendarDays,
    path: '/schedule',
  },
  {
    id: 'performance',
    title: 'مدیریت و پایش عملکرد',
    icon: Activity,
    path: '/performance',
  },
  {
    id: 'fuel',
    title: 'مدیریت سوخت',
    icon: Fuel,
    path: '/fuel',
  },
  {
    id: 'training',
    title: 'آموزش',
    icon: GraduationCap,
    path: '/training',
  },
  {
    id: 'messages',
    title: 'صندوق پیام',
    icon: Mail,
    path: '/messages',
  },
];

export const USER_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'داشبورد',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    id: 'base_info',
    title: 'مشخصات پایگاه',
    icon: Building2,
    path: '/base-info',
  },
  {
    id: 'base_personnel',
    title: 'پرسنل پایگاه',
    icon: Users,
    path: '/base-personnel',
  },
  {
    id: 'schedule',
    title: 'برنامه ماهانه',
    icon: CalendarDays,
    path: '/schedule',
  },
  {
    id: 'performance',
    title: 'کارکرد ماهانه',
    icon: Activity,
    path: '/performance',
  },
  {
    id: 'fuel',
    title: 'ثبت سوخت',
    icon: Fuel,
    path: '/fuel',
  },
  {
    id: 'training',
    title: 'آموزش',
    icon: GraduationCap,
    path: '/training',
  },
  {
    id: 'messages',
    title: 'صندوق پیام',
    icon: Mail,
    path: '/messages',
  },
];
