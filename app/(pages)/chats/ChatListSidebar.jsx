"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useUser } from "@/app/hooks/useUser";
import {
    Plus,
    MessageSquare,
    Trash2,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChatListSidebar({ activeRoomId }) {
    const { user } = useUser();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { data, error, isLoading, mutate } = useSWR("/api/chat/rooms", fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 15_000,
    });

    const handleCreateChat = async () => {
        const roomName = prompt("Enter chat room name:");
        if (!roomName?.trim() || !user) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/chat/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: roomName.trim(),
                    user_id: user.user_id,
                }),
            });

            const result = await res.json();
            if (result.success) {
                mutate();
                toast.success("Chat room created successfully!");
                const id = result.createdChatRoom?.room_id;
                if (id) router.push(`/chats/${id}`);
            } else {
                alert(result.message || "Failed to create room");
            }
        } catch (err) {
            console.error("Create Room Error:", err);
            alert("Something went wrong.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRoom = async (roomId, roomName) => {
        if (
            !confirm(
                `Delete “${roomName}”? This cannot be undone.`
            )
        ) {
            return;
        }

        setDeletingId(roomId);
        try {
            const res = await fetch(`/api/chat/rooms/${roomId}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                mutate();
                toast.success("Chat room deleted successfully!");
                if (String(activeRoomId) === String(roomId)) {
                    router.push("/chats");
                }
            } else {
                alert(result.message || "Failed to delete room");
            }
        } catch (err) {
            console.error("Delete Room Error:", err);
            alert("Something went wrong while deleting.");
        } finally {
            setDeletingId(null);
        }
    };

    if (error) {
        return (
            <div className="flex min-h-50 flex-col items-center justify-center gap-2 p-4 text-center sm:p-6">
                <p className="text-sm font-medium text-red-600">
                    Couldn’t load conversations
                </p>
                <p className="text-xs text-slate-500">
                    Check your connection and try again.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-x-hidden bg-white">
            <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-center gap-2 text-slate-500">
                    <MessageSquare size={18} strokeWidth={2} className="shrink-0" />
                    <span className="truncate text-sm font-medium text-slate-600">
                        All Message
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleCreateChat}
                    disabled={isCreating}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-50"
                    title="New room"
                    aria-label="New chat room"
                >
                    <Plus size={18} strokeWidth={2.5} />
                </button>
            </div>

            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:thin]">
                {isLoading ? (
                    <ul className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <li key={i} className="flex animate-pulse gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
                                <div className="h-12 w-12 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                                    <div className="h-3 w-1/2 rounded bg-slate-50" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {data?.rooms?.map((room) => {
                            const isActive =
                                activeRoomId &&
                                String(activeRoomId) === String(room.room_id);
                            return (
                                <li key={room.room_id} className="group relative">
                                    <Link
                                        href={`/chats/${room.room_id}`}
                                        className={`flex items-center gap-3 px-3 py-2.5 pr-11 transition-colors sm:px-4 sm:py-3 sm:pr-12 ${isActive
                                                ? "bg-teal-50/80"
                                                : "hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(room.room_id)}`}
                                                alt=""
                                                className="h-12 w-12 rounded-full bg-slate-100 ring-2 ring-white"
                                            />
                                            <span
                                                className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"
                                                aria-hidden
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-slate-900">
                                                {room.name}
                                            </p>
                                            <p className="truncate text-sm text-slate-500">
                                                {room.creator?.name
                                                    ? `Created by ${room.creator.name}`
                                                    : "Team room"}
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteRoom(
                                                room.room_id,
                                                room.name
                                            );
                                        }}
                                        disabled={deletingId === room.room_id}
                                        className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 group-focus-within:opacity-100 disabled:opacity-40 sm:right-2"
                                        title="Delete room"
                                        aria-label="Delete room"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {data?.rooms?.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center px-6 py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
                            <Sparkles
                                className="text-teal-600"
                                size={22}
                                strokeWidth={1.75}
                            />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            No rooms yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Tap + to start a conversation.
                        </p>
                        <button
                            type="button"
                            onClick={handleCreateChat}
                            className="mt-4 text-xs font-semibold text-teal-700 hover:underline"
                        >
                            Create a room
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
