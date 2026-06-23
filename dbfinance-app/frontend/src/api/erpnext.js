import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const getProjects = () =>
  api.get('/resource/Project Finance?fields=["*"]');

export const createProject = (data) =>
  api.post('/resource/Project Finance', data);

export const deleteProject = (name) =>
  api.delete(`/resource/Project Finance/${name}`);