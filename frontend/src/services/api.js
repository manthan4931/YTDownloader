import axios from 'axios';

const API_BASE_URL = 'https://ytdownloader-dwjh.onrender.com';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const fetchVideoInfo = async (url) => {
  const response = await api.get('/api/info', { params: { url } });
  return response.data;
};

export const downloadAudio = async (url, format = 'mp3') => {
  const response = await api.get('/api/download/audio', {
    params: { url, format },
    responseType: 'blob',
  });
  
  // Create download link
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `audio.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const downloadVideo = async (url, quality = '720') => {
  const response = await api.get('/api/download/video', {
    params: { url, quality },
    responseType: 'blob',
  });
  
  // Create download link
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'video.mp4');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
