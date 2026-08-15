import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/secureStore';
import { Platform } from 'react-native';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL 
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') 
  : 'http://192.168.1.49:5000';

let socket: Socket | null = null;

export const getSocket = () => socket;

export const initSocket = async () => {
  if (socket) return socket;
  
  const token = await getToken('accessToken');
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
