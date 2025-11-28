import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://101.42.169.71:3000/api';

export const getDashboardStats = () =>
  axios.get(`${API_BASE}/dashboard/stats`);

export const getBorrowTrend = () =>
  axios.get(`${API_BASE}/dashboard/borrow-trend`);