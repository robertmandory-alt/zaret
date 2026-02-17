
import { User, Personnel, Shift, Base, UserRole, BaseConfig, MonthlyRoster } from '../types';

// Storage Keys
const STORAGE_KEYS = {
  PERSONNEL: 'ems_personnel',
  USERS: 'ems_users',
  SHIFTS: 'ems_shifts',
  BASES: 'ems_bases',
  BASE_CONFIG: 'ems_base_config',
  BASE_PERSONNEL_MAP: 'ems_base_personnel_map',
  ROSTERS: 'ems_rosters'
};

// Initial Mock Data (Fallback)
const initialPersonnel: Personnel[] = [
  { 
    id: '1', 
    firstName: 'علی', 
    lastName: 'رضایی', 
    nationalId: '1234567890', 
    employmentStatus: 'official', 
    productivityStatus: 'productive', 
    driverStatus: 'driver',
    workExperience: '8-12' 
  },
  { 
    id: '2', 
    firstName: 'محمد', 
    lastName: 'محمدی', 
    nationalId: '0987654321', 
    employmentStatus: 'contractual', 
    productivityStatus: 'productive', 
    driverStatus: 'non-driver',
    workExperience: '0-4' 
  },
  { 
    id: '3', 
    firstName: 'حسین', 
    lastName: 'اکبری', 
    nationalId: '1122334455', 
    employmentStatus: 'official', 
    productivityStatus: 'productive', 
    driverStatus: 'driver',
    workExperience: '12-16' 
  },
  { 
    id: '4', 
    firstName: 'رضا', 
    lastName: 'کریمی', 
    nationalId: '5544332211', 
    employmentStatus: 'contractual', 
    productivityStatus: 'non-productive', 
    driverStatus: 'non-driver',
    workExperience: '4-8' 
  },
  { 
    id: '99', 
    firstName: 'مدیر', 
    lastName: 'سیستم', 
    nationalId: '0000000000', 
    employmentStatus: 'official', 
    productivityStatus: 'productive', 
    driverStatus: 'non-driver',
    workExperience: '16+' 
  },
];

const initialUsers: User[] = [
  { 
    id: '1', 
    fullName: 'مدیر سیستم', 
    username: 'admin', 
    password: 'admin1', 
    role: UserRole.ADMIN, 
    isActive: true, 
    lastLogin: '1402/12/20 10:30',
    permissions: ['users', 'personnel', 'shifts', 'bases', 'performance', 'schedule', 'fuel', 'training', 'messages'], 
    personnelId: '99'
  },
  { 
    id: '2', 
    fullName: 'علی رضایی', 
    username: 'ems', 
    password: '1234', 
    role: UserRole.USER, 
    isActive: true, 
    lastLogin: '1402/12/19 08:15',
    permissions: ['personnel', 'shifts'], 
    personnelId: '1'
  },
];

const initialShifts: Shift[] = [
  { id: '1', title: 'شیفت ۲۴ ساعته', code: '24h', hours: 24, color: 'bg-green-100 text-green-700' },
  { id: '2', title: 'شیفت صبح', code: 'M', hours: 7, color: 'bg-yellow-100 text-yellow-700' },
  { id: '3', title: 'شیفت شب', code: 'N', hours: 12, color: 'bg-indigo-100 text-indigo-700' },
  { id: '4', title: 'شیفت عصر', code: 'E', hours: 7, color: 'bg-orange-100 text-orange-700' },
  { id: '5', title: 'شیفت لانگ', code: 'L', hours: 12, color: 'bg-purple-100 text-purple-700' },
  { id: '6', title: 'آف', code: 'OFF', hours: 0, color: 'bg-gray-100 text-gray-500' },
];

const initialBases: Base[] = [
  { id: '1', name: 'پایگاه مرکزی', type: 'urban', number: '1', code: '101' },
  { id: '2', name: 'پایگاه جاده‌ای امام رضا', type: 'road', number: '2', code: '201' },
];

const initialBasePersonnelMap: { [baseId: string]: string[] } = {
  '1': ['1', '2'] 
};

// Helper: Load from LocalStorage or use initial data
function loadData<T>(key: string, initial: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  } catch (e) {
    console.error(`Error loading data for key ${key}`, e);
    return initial;
  }
}

// Helper: Save to LocalStorage
function persistData(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving data for key ${key}`, e);
  }
}

// Initialize Data in Memory
let personnel = loadData<Personnel[]>(STORAGE_KEYS.PERSONNEL, initialPersonnel);
let users = loadData<User[]>(STORAGE_KEYS.USERS, initialUsers);
let shifts = loadData<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
let bases = loadData<Base[]>(STORAGE_KEYS.BASES, initialBases);
let basePersonnelMap = loadData<{ [baseId: string]: string[] }>(STORAGE_KEYS.BASE_PERSONNEL_MAP, initialBasePersonnelMap);
let rosters = loadData<MonthlyRoster[]>(STORAGE_KEYS.ROSTERS, []);
let currentUserBaseConfig = loadData<BaseConfig | null>(STORAGE_KEYS.BASE_CONFIG, null);

// Generic Helper for ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- User Service ---
export const getUsers = () => Promise.resolve([...users]);
export const saveUser = (user: User) => {
  if (user.id) {
    users = users.map(u => u.id === user.id ? { ...u, ...user } : u);
  } else {
    users = [...users, { ...user, id: generateId(), isActive: true, lastLogin: '-' }];
  }
  persistData(STORAGE_KEYS.USERS, users);
  return Promise.resolve(user);
};
export const deleteUser = (id: string) => {
  users = users.filter(u => u.id !== id);
  persistData(STORAGE_KEYS.USERS, users);
  return Promise.resolve();
};
export const toggleUserStatus = (id: string) => {
  const user = users.find(u => u.id === id);
  if (user) {
    user.isActive = !user.isActive;
    persistData(STORAGE_KEYS.USERS, users);
  }
  return Promise.resolve(user);
};

// --- Personnel Service ---
export const getPersonnel = () => Promise.resolve([...personnel]);
export const getPersonnelById = (id: string) => Promise.resolve(personnel.find(p => p.id === id));
export const savePersonnel = (person: Personnel) => {
  if (person.id) {
    personnel = personnel.map(p => p.id === person.id ? person : p);
  } else {
    personnel = [...personnel, { ...person, id: generateId() }];
  }
  persistData(STORAGE_KEYS.PERSONNEL, personnel);
  return Promise.resolve();
};
export const deletePersonnel = (id: string) => {
  personnel = personnel.filter(p => p.id !== id);
  persistData(STORAGE_KEYS.PERSONNEL, personnel);
  return Promise.resolve();
};

// --- Shift Service ---
export const getShifts = () => Promise.resolve([...shifts]);
export const saveShift = (shift: Shift) => {
  if (shift.id) {
    shifts = shifts.map(s => s.id === shift.id ? shift : s);
  } else {
    shifts = [...shifts, { ...shift, id: generateId() }];
  }
  persistData(STORAGE_KEYS.SHIFTS, shifts);
  return Promise.resolve();
};
export const deleteShift = (id: string) => {
  shifts = shifts.filter(s => s.id !== id);
  persistData(STORAGE_KEYS.SHIFTS, shifts);
  return Promise.resolve();
};

// --- Base Service ---
export const getBases = () => Promise.resolve([...bases]);
export const getBaseById = (id: string) => Promise.resolve(bases.find(b => b.id === id));
export const saveBase = (base: Base) => {
  if (base.id) {
    bases = bases.map(b => b.id === base.id ? base : b);
  } else {
    bases = [...bases, { ...base, id: generateId() }];
  }
  persistData(STORAGE_KEYS.BASES, bases);
  return Promise.resolve();
};
export const deleteBase = (id: string) => {
  bases = bases.filter(b => b.id !== id);
  persistData(STORAGE_KEYS.BASES, bases);
  return Promise.resolve();
};

// --- User Panel Services ---

// Base Config
export const getBaseConfig = (userId: string) => {
  return Promise.resolve(currentUserBaseConfig);
};

export const saveBaseConfig = (config: BaseConfig) => {
  currentUserBaseConfig = config;
  persistData(STORAGE_KEYS.BASE_CONFIG, currentUserBaseConfig);
  return Promise.resolve(config);
};

// Base Personnel
export const getBasePersonnel = (baseId: string) => {
  const ids = basePersonnelMap[baseId] || [];
  const list = personnel.filter(p => ids.includes(p.id));
  return Promise.resolve(list);
};

export const addPersonnelToBase = (baseId: string, personnelId: string) => {
  if (!basePersonnelMap[baseId]) basePersonnelMap[baseId] = [];
  if (!basePersonnelMap[baseId].includes(personnelId)) {
    basePersonnelMap[baseId] = [...basePersonnelMap[baseId], personnelId];
    persistData(STORAGE_KEYS.BASE_PERSONNEL_MAP, basePersonnelMap);
  }
  return Promise.resolve();
};

export const removePersonnelFromBase = (baseId: string, personnelId: string) => {
  if (basePersonnelMap[baseId]) {
    basePersonnelMap[baseId] = basePersonnelMap[baseId].filter(id => id !== personnelId);
    persistData(STORAGE_KEYS.BASE_PERSONNEL_MAP, basePersonnelMap);
  }
  return Promise.resolve();
};

// Roster
export const getRoster = (baseId: string, year: number, month: number) => {
  const roster = rosters.find(r => r.baseId === baseId && r.year === year && r.month === month);
  return Promise.resolve(roster || null);
};

export const saveRoster = (roster: MonthlyRoster) => {
  const index = rosters.findIndex(r => r.id === roster.id);
  if (index >= 0) {
    rosters[index] = roster;
  } else {
    rosters = [...rosters, { ...roster, id: generateId() }];
  }
  persistData(STORAGE_KEYS.ROSTERS, rosters);
  return Promise.resolve(roster);
};
