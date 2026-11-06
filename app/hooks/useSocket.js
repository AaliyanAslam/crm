"use client";

import { useSyncExternalStore } from "react";
import { getSocketInstance } from "@/app/lib/socketClient";

function subscribe(callback) {
    const s = getSocketInstance();
    if (!s) return () => {};

    s.on("connect", callback);
    s.on("disconnect", callback);

    return () => {
        s.off("connect", callback);
        s.off("disconnect", callback);
    };
}

function getSnapshot() {
    return getSocketInstance();
}

function getServerSnapshot() {
    return null;
}

/**
 * useSocket Hook
 * Idiomatic React 19 external store subscriber for the singleton Socket.io client.
 * Provides immediate connection on mount and across room switches with zero teardown.
 */
export const useSocket = () => {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
