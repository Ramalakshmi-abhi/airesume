import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5005",
  timeout: 120000, // 120 seconds
});

API.interceptors.request.use((config) => {
  console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const uploadResume = (formData, onProgress) =>
  API.post("upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const analyzeResume = (data) => API.post("analyze", data);
export const matchJob = (data) => API.post("match-job", data);
export const rewriteResume = (data) => API.post("rewrite", data);
export const getHistory = (userId) => API.get(`history?userId=${userId}`);
export const chatWithAI = (data) => API.post("chat", data);
export const getRoadmap = (data) => API.post("roadmap", data);
export const getInterviewPrep = (data) => API.post("interview-prep", data);
export const downloadResume = (data) => API.post("analyze/download", data);

export default API;
