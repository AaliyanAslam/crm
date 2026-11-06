"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Sidebar = dynamic(() => import("./component/Sidebar"), {
    ssr: false,
    loading: () => (
        <div className="shrink-0">
            <div className="hidden md:block h-0 w-20" aria-hidden />
            <div className="md:hidden h-16 shrink-0" aria-hidden />
        </div>
    ),
});

export default function ClientLayout({ children }) {
    const pathname = usePathname() || "";
    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isChatsRoute =
        pathname.startsWith("/chats") || pathname.startsWith("/chat");

    const mainClass = isAuthPage
        ? "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip"
        : isChatsRoute
          ? "flex min-h-0 min-w-0 w-full flex-1 basis-0 flex-col overflow-x-clip overflow-y-hidden md:ml-20 md:w-[calc(100%-5rem)] md:max-w-[calc(100%-5rem)]"
          : "flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-clip md:ml-20 md:w-[calc(100%-5rem)] md:max-w-[calc(100%-5rem)]";

    const rootClass = isChatsRoute
        ? "flex h-dvh max-h-dvh min-h-0 w-full max-w-full flex-col overflow-x-clip overflow-y-hidden"
        : "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip";

    return (
        <div className={rootClass} suppressHydrationWarning>
            <Sidebar />
            <main className={mainClass} suppressHydrationWarning>{children}</main>
        </div>
    );
}
