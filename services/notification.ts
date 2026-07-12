import axios from 'axios';
import { api, API_ENDPOINTS } from '../constants/api';

export type NotificationItem = {
  id: number;
  is_read: number;
  created_at: string;
  announcement_id: number;
  title: string;
  body: string;
};

export async function getNotifications(userId: number | string) {
  try {
    const res = await api.get(API_ENDPOINTS.notifications(userId));
    return res.data as { success: boolean; notifications: NotificationItem[] };
  } catch (err) {
    console.log('NOTIFICATIONS ERROR:', axios.isAxiosError(err) ? err.message : err);
    return { success: false, notifications: [] as NotificationItem[] };
  }
}

export async function markNotificationsRead(userId: number | string) {
  try {
    await api.post(API_ENDPOINTS.markNotificationsRead, { user_id: userId });
    return true;
  } catch (err) {
    console.log('MARK READ ERROR:', axios.isAxiosError(err) ? err.message : err);
    return false;
  }
}