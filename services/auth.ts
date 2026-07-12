import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api, API_ENDPOINTS } from '../constants/api';

const STORAGE_KEY = '@trackademic_user';

export type User = {
  id: number;
  sr_code: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  course: string | null;
  avatar: string | null;
  has_avatar?: boolean;
};

export async function login(email: string, password: string) {
  try {
    const res = await api.post(API_ENDPOINTS.login, { email, password });
    if (res.data.success) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (err) {
    console.log('LOGIN ERROR CODE:', axios.isAxiosError(err) ? err.code : 'unknown');
    console.log('LOGIN ERROR MESSAGE:', axios.isAxiosError(err) ? err.message : err);
    console.log('LOGIN ERROR RESPONSE:', axios.isAxiosError(err) ? err.response?.data : 'no response');
    if (axios.isAxiosError(err) && err.response) {
      return err.response.data; // { success: false, message: "..." } from PHP
    }
    return { success: false, message: 'Could not connect to server.' };
  }
}

export async function register(payload: {
  sr_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  course?: string;
}) {
  try {
    const res = await api.post(API_ENDPOINTS.register, payload);
    return res.data;
  } catch (err) {
    console.log('REGISTER ERROR CODE:', axios.isAxiosError(err) ? err.code : 'unknown');
    console.log('REGISTER ERROR MESSAGE:', axios.isAxiosError(err) ? err.message : err);
    if (axios.isAxiosError(err) && err.response) {
      return err.response.data;
    }
    return { success: false, message: 'Could not connect to server.' };
  }
}

export async function resetPassword(email: string, newPassword: string) {
  try {
    const res = await api.post(API_ENDPOINTS.resetPassword, { email, new_password: newPassword });
    return res.data as { success: boolean; message: string };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return err.response.data;
    }
    return { success: false, message: 'Could not connect to server.' };
  }
}

export async function getProfile(userId: number | string) {
  try {
    const res = await api.get(API_ENDPOINTS.profile(userId));
    if (res.data.success) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
    }
    return res.data as { success: boolean; user?: User; message?: string };
  } catch (err) {
    console.log('GET PROFILE ERROR:', axios.isAxiosError(err) ? err.message : err);
    return { success: false, message: 'Could not connect to server.' };
  }
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function logout() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}