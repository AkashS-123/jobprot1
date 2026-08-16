import api from './client';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<User | null> {
  const res = await api.get('/users', { params: { email } });
  const user: User | undefined = res.data[0];
  if (!user || user.password !== password) return null;
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const res = await api.get('/users', { params: { email } });
  return res.data[0] ?? null;
}

export async function registerUser(payload: Omit<User, 'id'>): Promise<User> {
  const res = await api.post('/users', payload);
  return res.data;
}

export async function fetchUserById(id: string): Promise<User> {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User> {
  const res = await api.patch(`/users/${id}`, patch);
  return res.data;
}
