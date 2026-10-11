import { Storage } from '../storage';
import { User } from '../../../shared/types';

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return Storage.getUserByEmail(email);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return Storage.getUserById(id);
}

export async function createUser(name: string, email: string, passwordHash: string, role: 'citizen' | 'admin' = 'citizen', block_division?: string): Promise<User> {
  return Storage.addUser({ name, email, passwordHash, role, block_division });
}

export async function setPasswordResetToken(email: string, token: string, expires: string): Promise<boolean> {
  return Storage.setResetToken(email, token, expires);
}

export async function updatePassword(email: string, newPasswordHash: string): Promise<boolean> {
  return Storage.updateUserPassword(email, newPasswordHash);
}
