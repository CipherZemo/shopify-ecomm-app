import io from 'socket.io-client';

let socket = null;
let isConnected = false;

export const initSocket = (token) => {
  if (!token) return null;

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    isConnected = true;
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    isConnected = false;
    console.log('❌ Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const isSocketConnected = () => isConnected;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
};