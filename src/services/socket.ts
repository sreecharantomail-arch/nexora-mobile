import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/secureStore';

if (!process.env.EXPO_PUBLIC_API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is missing. Please set EXPO_PUBLIC_API_URL in your .env file.');
}

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL.replace('/api', '');

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
