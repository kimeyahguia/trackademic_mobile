import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_ENDPOINTS } from '../constants/api';
import { User } from './auth';

const STORAGE_KEY = '@trackademic_user';

function handleError(err: unknown) {
  if (axios.isAxiosError(err) && err.response) {
    return err.response.data;
  }
  return { success: false, message: 'Could not connect to server.' };
}

export async function updateProfile(payload: {
  id: number;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  email: string;
  course?: string;
}) {
  try {
    const res = await api.post(API_ENDPOINTS.profileUpdate, payload);
    if (res.data.success && res.data.user) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
    }
    return res.data as { success: boolean; message: string; user?: User };
  } catch (err) {
    console.log('PROFILE UPDATE ERROR:', axios.isAxiosError(err) ? (err.response?.data ?? err.message) : err);
    return handleError(err);
  }
}

export async function uploadAvatar(userId: number, imageUri: string, mimeType: string) {
  try {
    const formData = new FormData();
    formData.append('id', String(userId));
    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${mimeType.split('/')[1] || 'jpg'}`,
      type: mimeType,
    } as any);

    const res = await api.post(API_ENDPOINTS.avatarUpload, formData, {
      headers: { 'Content-Type': undefined }, // let RN/axios set multipart boundary automatically
      transformRequest: (data) => data, // prevent axios from JSON-stringifying FormData
    });
    return res.data as { success: boolean; message: string };
  } catch (err) {
    console.log('AVATAR UPLOAD ERROR:', axios.isAxiosError(err) ? (err.response?.data ?? err.message) : err);
    return handleError(err);
  }
}