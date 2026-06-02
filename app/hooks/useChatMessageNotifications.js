"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * In-app toast + optional browser Notification for incoming chat messages.
 */
export function useChatMessageNotifications(roomId, currentUserId) {
    const [toast, setToast] = useState(null);
    const [permission, setPermission] = useState(
        typeof Notification !== "undefined" ? Notification.permission : "denied"
    );
    const toastTimerRef = useRef(null);

    useEffect(() => {
        if (typeof Notification === "undefined") return;
        setPermission(Notification.permission);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const requestBrowserPermission = useCallback(async () => {
        if (typeof Notification === "undefined") return "unsupported";
        const p = await Notification.requestPermission();
        setPermission(p);
        return p;
    }, []);

    const notifyIncomingMessage = useCallback(
        (msg) => {
            if (
                !msg ||
                currentUserId == null ||
                msg.user_id === currentUserId
            ) {
                return;
            }

            const name = msg.sender?.name || "Team member";
            const preview = String(msg.text || "").slice(0, 160);
            if (typeof window === "undefined") return;

            const hidden = document.visibilityState === "hidden";

            if (!hidden) {
                setToast({ name, preview, key: msg.id ?? `${Date.now()}` });
                if (toastTimerRef.current) {
                    clearTimeout(toastTimerRef.current);
                }
                toastTimerRef.current = setTimeout(() => {
                    setToast(null);
                }, 4200);
            }

            if (
                typeof Notification !== "undefined" &&
                Notification.permission === "granted" &&
                hidden
            ) {
                try {
                    const n = new Notification(`${name}`, {
                        body: preview,
                        tag: `chat-${roomId}-${msg.id ?? preview.slice(0, 20)}`,
                        icon: "/logo/dklogo.png",
                    });
                    n.onclick = () => {
                        window.focus();
                        n.close();
                    };
                } catch {
                    /* ignore */
                }
            }
        },
        [currentUserId, roomId]
    );

    const dismissToast = useCallback(() => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToast(null);
    }, []);

    return {
        toast,
        dismissToast,
        notifyIncomingMessage,
        permission,
        requestBrowserPermission,
        notificationsSupported: typeof Notification !== "undefined",
    };
}
