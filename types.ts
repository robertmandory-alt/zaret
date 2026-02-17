
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id?: string; // Optional for auth context, required for management
  username: string;
  role: UserRole;
  fullName: string;
  password?: string; // Only for management purposes
  isActive?: boolean;
  lastLogin?: string;
  permissions?: string[];
  personnelId?: string; // Link to Personnel
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface MenuItem {
  id: string;
  title: string;
  icon: any;
  path: string;
}

// Module 2: Personnel
export interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  employmentStatus: 'official' | 'contractual'; // رسمی | طرحی
  productivityStatus: 'productive' | 'non-productive'; // بهره‌ور | غیر بهره‌ور
  driverStatus: 'driver' | 'non-driver'; // راننده | غیر راننده
  workExperience: '0-4' | '4-8' | '8-12' | '12-16' | '16+'; // سابقه کاری
}

// Module 3: Shifts
export interface Shift {
  id: string;
  title: string;
  hours: number;
  code: string;
  color?: string; // For UI display in grid
}

// Module 4: Bases
export interface Base {
  id: string;
  name: string;
  type: 'urban' | 'road'; // شهری | جاده‌ای
  number: string;
  code: string;
}

// User Panel Specific Types

export interface BaseConfig {
  id: string; // usually linked to user ID or a unique config ID
  baseId: string;
  supervisorId: string;
  signature?: string; // Base64 string of the signature
  isLocked: boolean;
  lastUpdated: string;
}

// Schedule Types
export interface ScheduleItem {
  day: number; // 1-31
  shiftId: string | null; // null means OFF or not set
}

export interface RosterRow {
  personnelId: string;
  isGuest: boolean;
  shifts: { [day: number]: string | null }; // Map day number to shift ID
}

export interface MonthlyRoster {
  id: string;
  year: number;
  month: number;
  baseId: string;
  rows: RosterRow[];
  status: 'draft' | 'final';
}
