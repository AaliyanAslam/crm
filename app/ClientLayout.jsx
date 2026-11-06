"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

const Sidebar = dynamic(() => import("./component/Sidebar"), {
    ssr: false,
    loading: () => (
        <div className="shrink-0">
            <div className="hidden md:block h-0 w-20" aria-hidden />
            <div className="md:hidden h-16 shrink-0" aria-hidden />
        </div>
    ),
});

function ClientLayoutContent({ children }) {
    const pathname = usePathname() || "";
    const { isCollapsed } = useSidebar();

    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isChatsRoute =
        pathname.startsWith("/chats") || pathname.startsWith("/chat");

    // Pre-warm socket on authenticated app pages for instant Live chat switching
    useEffect(() => {
        if (!isAuthPage) {
            import("./lib/socketClient").then(({ prewarmSocket }) => {
                prewarmSocket();
            }).catch(() => {});
        }
    }, [isAuthPage]);

    const desktopMarginWidth = isCollapsed
        ? "md:ml-20 md:w-[calc(100%-5rem)] md:max-w-[calc(100%-5rem)]"
        : "md:ml-64 md:w-[calc(100%-16rem)] md:max-w-[calc(100%-16rem)]";

    const mainClass = isAuthPage
        ? "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip"
        : isChatsRoute
          ? `flex min-h-0 min-w-0 w-full flex-1 basis-0 flex-col overflow-x-clip overflow-y-hidden transition-[margin,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${desktopMarginWidth}`
          : `flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-clip transition-[margin,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${desktopMarginWidth}`;

    const rootClass = isChatsRoute
        ? "flex h-dvh max-h-dvh min-h-0 w-full max-w-full flex-col overflow-x-clip overflow-y-hidden"
        : "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip";

    return (
        <div className={rootClass} suppressHydrationWarning>
            <Sidebar />
            <main className={mainClass} suppressHydrationWarning>
                {children}
            </main>
        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <SidebarProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
        </SidebarProvider>
    );
}
