"use client";

import { io } from "socket.io-client";

let socketInstance = null;
let bootstrapPromise = null;

/**
 * Trigger server-side Socket.IO bootstrap endpoint non-blocking in background.
 */
function ensureServerBootstrapped() {
    if (typeof window === "undefined") return;
    if (!bootstrapPromise) {
        bootstrapPromise = fetch("/api/socket", {
            method: "GET",
            cache: "no-store",
        }).catch((err) => {
            if (process.env.NODE_ENV === "development") {
                console.warn("[socket] Bootstrap ping error:", err);
            }
        });
    }
    return bootstrapPromise;
}

/**
 * Returns the singleton Socket.io instance.
 * Reused globally across the entire app lifecycle and all room switches.
 */
export function getSocketInstance() {
    if (typeof window === "undefined") return null;

    if (!socketInstance) {
        ensureServerBootstrapped();

        const origin = window.location.origin;

        socketInstance = io(origin, {
            path: "/api/socket",
            addTrailingSlash: false,
            // Direct WebSocket transport first for instant <50ms connection
            transports: ["websocket", "polling"],
            upgrade: true,
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 400,
            reconnectionDelayMax: 3000,
            timeout: 10000,
            autoConnect: true,
        });

        if (process.env.NODE_ENV === "development") {
            socketInstance.on("connect", () => {
                console.log("[socket] Connected (id:", socketInstance.id, ")");
            });
            socketInstance.on("disconnect", (reason) => {
                console.log("[socket] Disconnected:", reason);
            });
            socketInstance.on("connect_error", (err) => {
                console.warn("[socket] connect_error:", err?.message || err);
            });
        }
    }

    return socketInstance;
}

/**
 * Explicit pre-warm function to start connection as early as possible.
 */
export function prewarmSocket() {
    return getSocketInstance();
}

