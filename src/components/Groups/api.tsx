import axios from 'axios';
import { ExtendedGroup, JoinRequest } from './types';

const API_BASE_URL = 'http://localhost:3000';

const getAuthToken = () => localStorage.getItem('access_token');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchGroups = async (userId: string): Promise<{ publicGroups: ExtendedGroup[], privateGroups: ExtendedGroup[] }> => {
  const [publicResponse, privateResponse] = await Promise.all([
    api.get('/groups/public'),
    api.get('/groups/private')
  ]);

  const userIdNumber = parseInt(userId, 10);

  const publicGroups = publicResponse.data.map((group: ExtendedGroup) => ({
    ...group,
    isOwner: group.owner.id === userIdNumber,
    isMember: group.owner.id !== userIdNumber && group.users.some(user => user.id === userIdNumber)
  }));

  const privateGroups = privateResponse.data.map((group: ExtendedGroup) => ({
    ...group,
    isOwner: group.owner.id === userIdNumber,
    isMember: group.users.some(user => user.id === userIdNumber)
  }));

  return { publicGroups, privateGroups };
};

export const fetchJoinRequestsForGroup = async (groupId: number): Promise<JoinRequest[]> => {
  const response = await api.get(`/groups/${groupId}/join-requests`);
  return response.data.map((request: any) => ({
    id: request.id,
    fullName: request.user.fullName,
    status: request.status
  }));
};

export const createGroup = async (name: string, visibility: 'public' | 'private'): Promise<ExtendedGroup> => {
  const response = await api.post('/groups/create', { name, visibility });
  return response.data;
};

export const joinPublicGroup = async (groupId: number): Promise<void> => {
  await api.post(`/groups/${groupId}/join`);
};

export const requestPrivateGroup = async (groupId: number): Promise<void> => {
  await api.post(`/groups/${groupId}/request-join`);
};

export const acceptJoinRequest = async (requestId: number): Promise<void> => {
  await api.post(`/groups/join-requests/${requestId}/approve`);
};

export const rejectJoinRequest = async (requestId: number): Promise<void> => {
  await api.post(`/groups/join-requests/${requestId}/decline`);
};

export const editGroupName = async (groupId: number, newName: string): Promise<void> => {
  await api.patch(`/groups/${groupId}/update-name`, { name: newName });
};

export const deleteGroup = async (groupId: number): Promise<void> => {
  await api.delete(`/groups/${groupId}`);
};

export const leaveGroup = async (groupId: number): Promise<void> => {
  await api.post(`/groups/${groupId}/leave`);
};

export const removeMember = async (groupId: number, memberId: number): Promise<void> => {
  await api.delete(`/groups/${groupId}/users/${memberId}`);
};