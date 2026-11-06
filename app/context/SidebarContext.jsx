"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const SidebarContext = createContext({
    isCollapsed: false,
    setIsCollapsed: () => {},
    toggleCollapse: () => {},
    isMobileOpen: false,
    setIsMobileOpen: () => {},
});

export function SidebarProvider({ children }) {
    // Default to false (expanded), but initialize from localStorage if available
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("crm_sidebar_collapsed");
            if (saved !== null) {
                const timer = setTimeout(() => {
                    setIsCollapsed(saved === "true");
                }, 0);
                return () => clearTimeout(timer);
            }
        } catch {
            // ignore localStorage errors
        }
    }, []);

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem("crm_sidebar_collapsed", String(next));
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    // Global keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                e.preventDefault();
                toggleCollapse();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleCollapse]);

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                setIsCollapsed,
                toggleCollapse,
                isMobileOpen,
                setIsMobileOpen,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}

