import axios from 'axios';
import { api, API_ENDPOINTS } from '../constants/api';

export type PerformanceItem = {
  id: number;
  class_code: string;
  subject_name: string;
  classwork_title: string;
  total_items: number;
  score: number;
  school_year: string;
  semester: string;
};

// ---- generic error handler ----
function handleError(err: unknown) {
  if (axios.isAxiosError(err) && err.response) {
    return err.response.data;
  }
  return { success: false, message: 'Could not connect to server.' };
}

// ---- My Performance list ----
export async function getPerformance(studentId: number) {
  try {
    const res = await api.get(API_ENDPOINTS.performance(studentId));
    return res.data as { success: boolean; data: PerformanceItem[]; message?: string };
  } catch (err) {
    return handleError(err);
  }
}