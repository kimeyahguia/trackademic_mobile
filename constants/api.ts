import axios from 'axios';

// Using physical device on the same WiFi network as your PC (XAMPP)
// Make sure htdocs folder is named "trackademik" to match this path
export const BASE_URL = 'http://192.168.11.177/trackademik';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const API_ENDPOINTS = {
  login: '/auth/login.php',
  resetPassword: '/auth/reset_password.php',
  register: '/auth/register.php',
  announcements: '/home/announcements.php',
  profileUpdate: '/profile/update.php',
  profile: (userId: number | string) => `/profile/get.php?user_id=${userId}`,
  avatarUpload: '/profile/avatar_upload.php',
  avatarUrl: (userId: number) => `${BASE_URL}/profile/avatar.php?id=${userId}&t=${Date.now()}`,
  classesList: (studentId: number) => `/classes/list.php?student_id=${studentId}`,
  joinClass: '/classes/join.php',
  classDetails: (classId: number) => `/classes/details.php?class_id=${classId}`,
  materials: (classId: number) => `/classes/materials.php?class_id=${classId}`,
  classmates: (classId: number) => `/classes/classmates.php?class_id=${classId}`,
  attendance: (classId: number, studentId: number) =>
    `/classes/attendance.php?class_id=${classId}&student_id=${studentId}`,
  performance: (studentId: number) => `/performance/index.php?student_id=${studentId}`,
 
  // ...existing endpoints mo (login, register, resetPassword, etc.)
  notifications: (userId: number | string) => `/notifications/list.php?user_id=${userId}`,
  markNotificationsRead: `/notifications/mark_read.php`,
};