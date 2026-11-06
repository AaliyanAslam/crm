"use client";

import dynamic from "next/dynamic";

const ChatRoomClient = dynamic(
    () => import("../../chat/[id]/ChatRoomClient"),
    {
        ssr: false,
        loading: () => (
            <div
                className="flex h-full min-h-0 min-w-0 max-w-full flex-1 items-center justify-center bg-zinc-50/70 p-4"
                aria-busy="true"
                aria-label="Loading chat"
            >
                <div className="flex flex-col items-center gap-2.5">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                    <p className="text-xs font-medium text-zinc-500">
                        Opening conversation…
                    </p>
                </div>
            </div>
        ),
    }
);

export default function ChatRoomView({ roomId }) {
    return (
        <div className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden">
            <ChatRoomClient roomId={roomId} embedded />
        </div>
    );
}
