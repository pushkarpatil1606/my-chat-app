import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(user) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const socket = io(process.env.REACT_APP_SOCKET_URL, { transports: ['websocket','polling'] });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('setup', user._id));
    return () => { try { socket.disconnect(); } catch(e){} socketRef.current = null; };
  }, [user]);

  return socketRef;
}
