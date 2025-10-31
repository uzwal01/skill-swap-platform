import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  // Use the existing Axios baseURL and strip the REST prefix to get socket base.
  const apiBase = api.defaults.baseURL || 'http://localhost:5000/api/v1';
  const socketBase = new URL(apiBase).origin;

  socket = io(socketBase, {
    withCredentials: true,
    auth: { token },
  });
  return socket;
};

export const getSocket = () => socket;
