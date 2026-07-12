import axios from 'axios';
import { api, API_ENDPOINTS } from '../constants/api';

export type ClassSchedule = {
  day: string;
  start_time: string;
  end_time: string;
};

export type ClassItem = {
  id: number;
  class_code: string;
  subject_name: string;
  section: string;
  school_year: string;
  semester: string;
  status: 'active' | 'archived';
  meet_link: string | null;
  instructor_name: string;
  schedule: ClassSchedule[];
};

export type ClassDetails = {
  id: number;
  class_code: string;
  subject_name: string;
  section: string;
  school_year: string;
  semester: string;
  status: 'active' | 'archived';
  meet_link: string | null;
  instructor_name: string;
};

export type LearningMaterial = {
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_type: 'pdf' | 'ppt' | 'doc' | 'other';
  posted_at: string;
};

export type Classmate = {
  id: number;
  sr_code: string | null;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
};

export type AttendanceRecord = {
  date: string;
  time_in: string | null;
  status: string;
  points: number;
};

// ---- generic error handler ----
function handleError(err: unknown) {
  if (axios.isAxiosError(err) && err.response) {
    return err.response.data;
  }
  return { success: false, message: 'Could not connect to server.' };
}

// ---- My Classes list ----
export async function getMyClasses(studentId: number) {
  try {
    const res = await api.get(API_ENDPOINTS.classesList(studentId));
    return res.data as { success: boolean; data: ClassItem[]; message?: string };
  } catch (err) {
    return handleError(err);
  }
}

// ---- Join a class via class code ----
export async function joinClass(studentId: number, classCode: string) {
  try {
    const res = await api.post(API_ENDPOINTS.joinClass, {
      student_id: studentId,
      class_code: classCode,
    });
    return res.data as { success: boolean; message: string };
  } catch (err) {
    return handleError(err);
  }
}

// ---- Class details (header info) ----
export async function getClassDetails(classId: number) {
  try {
    const res = await api.get(API_ENDPOINTS.classDetails(classId));
    return res.data as { success: boolean; data: ClassDetails; message?: string };
  } catch (err) {
    return handleError(err);
  }
}

// ---- Learning Materials tab ----
export async function getMaterials(classId: number) {
  try {
    const res = await api.get(API_ENDPOINTS.materials(classId));
    return res.data as { success: boolean; data: LearningMaterial[]; message?: string };
  } catch (err) {
    return handleError(err);
  }
}

// ---- My Classmates tab ----
export async function getClassmates(classId: number) {
  try {
    const res = await api.get(API_ENDPOINTS.classmates(classId));
    return res.data as { success: boolean; data: Classmate[]; message?: string };
  } catch (err) {
    return handleError(err);
  }
}

// ---- Attendance tab ----
export async function getAttendance(classId: number, studentId: number) {
  try {
    const res = await api.get(API_ENDPOINTS.attendance(classId, studentId));
    return res.data as {
      success: boolean;
      student: { sr_code: string; name: string };
      data: AttendanceRecord[];
      message?: string;
    };
  } catch (err) {
    return handleError(err);
  }
}