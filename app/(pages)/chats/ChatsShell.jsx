"use client";

import { usePathname } from "next/navigation";
import { inter } from "@/app/fonts";
import { useSocket } from "@/app/hooks/useSocket";
import ChatListSidebar from "./ChatListSidebar";

export default function ChatsShell({ children }) {
    // Pre-warm persistent socket connection so all channel views are instantly Live
    useSocket();

    const pathname = usePathname() || "";
    const normalized = pathname.replace(/\/$/, "") || "/";
    const isChatsRoot = normalized === "/chats";
    const roomMatch = /^\/chats\/([^/]+)$/.exec(normalized);
    const activeRoomId = roomMatch?.[1] ?? null;
    const isRoomOpen = Boolean(activeRoomId);

    return (
        <div
            className={`flex h-full min-h-0 min-w-0 w-full max-w-full flex-1 basis-0 flex-col overflow-hidden bg-zinc-50/70 md:flex-row ${inter.className}`}
        >
            <aside
                className={
                    isRoomOpen
                        ? "hidden min-h-0 w-full min-w-0 flex-col overflow-hidden border-zinc-200/80 bg-white md:flex md:w-72 lg:w-80 md:flex-none md:shrink-0 md:border-r md:self-stretch"
                        : "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden border-zinc-200/80 bg-white md:w-72 lg:w-80 md:flex-none md:shrink-0 md:border-r md:self-stretch"
                }
            >
                <ChatListSidebar activeRoomId={activeRoomId} />
            </aside>

            <section
                className={
                    isChatsRoot
                        ? "hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex"
                        : "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                }
            >
                {children}
            </section>
        </div>
    );
}
