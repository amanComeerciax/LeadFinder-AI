import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket.io connected:', socketInstance.id);
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket.io disconnected');
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
