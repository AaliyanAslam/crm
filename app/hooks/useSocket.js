"use client"
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * useSocket Hook
 * Yeh hook Socket.io client ko initialize karta hai aur connection manage karta hai.
 */
export const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let socketInstance = null;
        let cancelled = false;

        const socketInitializer = async () => {
            try {
                await fetch('/api/socket', { method: 'GET', cache: 'no-store' });
            } catch {
                /* bootstrap request failed; client may still connect */
            }
            if (cancelled) return;

            const origin =
                typeof window !== 'undefined' ? window.location.origin : '';

            socketInstance = io(origin, {
                path: '/api/socket',
                addTrailingSlash: false,
                transports: ['polling', 'websocket'],
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 12,
                reconnectionDelay: 800,
                reconnectionDelayMax: 5000,
            });

            let loggedConnectError = false;
            socketInstance.on('connect', () => {
                loggedConnectError = false;
                if (process.env.NODE_ENV === 'development') {
                    console.log('Connected to Socket Server —', socketInstance.id);
                }
            });

            socketInstance.on('connect_error', (err) => {
                if (process.env.NODE_ENV !== 'development') return;
                if (!loggedConnectError) {
                    loggedConnectError = true;
                    console.warn('[socket] connect_error:', err?.message || err);
                }
            });

            if (!cancelled) {
                setSocket(socketInstance);
            }
        };

        socketInitializer();

        return () => {
            cancelled = true;
            if (socketInstance) {
                socketInstance.removeAllListeners();
                socketInstance.disconnect();
            }
        };
    }, []);

    return socket;
};