import { MOCK_CREDENTIALS } from '../constants';
import { User, UserRole } from '../types';

export const login = async (username: string, password: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!username || !password) return null;

  // Normalize inputs
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Check Admin Credentials
  // We check against both the constant and the explicit request values for redundancy
  const adminCreds = MOCK_CREDENTIALS[UserRole.ADMIN];
  const adminUserMatch = (cleanUsername === adminCreds.username.toLowerCase()) || (cleanUsername === 'admin');
  const adminPassMatch = (cleanPassword === adminCreds.password) || (cleanPassword === 'admin1') || (cleanPassword === 'admin');

  if (adminUserMatch && adminPassMatch) {
    return {
      username: 'admin',
      role: UserRole.ADMIN,
      fullName: 'مدیر سیستم',
    };
  }

  // Check User Credentials
  const userCreds = MOCK_CREDENTIALS[UserRole.USER];
  const normalUserMatch = (cleanUsername === userCreds.username.toLowerCase()) || (cleanUsername === 'ems');
  const normalPassMatch = (cleanPassword === userCreds.password) || (cleanPassword === '1234');

  if (normalUserMatch && normalPassMatch) {
    return {
      username: 'ems',
      role: UserRole.USER,
      fullName: 'پرسنل اورژانس',
    };
  }

  return null;
};