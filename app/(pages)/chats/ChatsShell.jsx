"use client";

import { usePathname } from "next/navigation";
import { inter } from "@/app/fonts";
import ChatListSidebar from "./ChatListSidebar";

export default function ChatsShell({ children }) {
    const pathname = usePathname() || "";
    const normalized = pathname.replace(/\/$/, "") || "/";
    const isChatsRoot = normalized === "/chats";
    const roomMatch = /^\/chats\/([^/]+)$/.exec(normalized);
    const activeRoomId = roomMatch?.[1] ?? null;
    const isRoomOpen = Boolean(activeRoomId);

    return (
        <div
            className={`flex min-h-0 min-w-0 w-full max-w-full flex-1 basis-0 flex-col overflow-x-clip overflow-y-hidden bg-slate-100 md:flex-row ${inter.className}`}
        >
            <aside
                className={
                    isRoomOpen
                        ? "hidden min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-x-clip border-slate-200/90 bg-white md:flex md:w-72 md:max-w-[min(100%,18rem)] md:flex-none md:shrink-0 md:border-r md:self-stretch lg:w-80 lg:max-w-80"
                        : "flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-x-clip border-slate-200/90 bg-white md:w-72 md:max-w-[min(100%,18rem)] md:flex-none md:shrink-0 md:border-r md:self-stretch lg:w-80 lg:max-w-80"
                }
            >
                <ChatListSidebar activeRoomId={activeRoomId} />
            </aside>

            <section
                className={
                    isChatsRoot
                        ? "hidden min-h-0 min-w-0 max-w-full flex-1 basis-0 flex-col overflow-x-clip overflow-y-hidden md:flex"
                        : "flex min-h-0 min-w-0 max-w-full flex-1 basis-0 flex-col overflow-x-clip overflow-y-hidden"
                }
            >
                {children}
            </section>
        </div>
    );
}
