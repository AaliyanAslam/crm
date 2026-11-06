"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useUser } from "@/app/hooks/useUser";
import {
    Plus,
    Hash,
    Trash2,
    Search,
    X,
    Users,
    MessageSquare,
    Loader2,
} from "lucide-react";
import { inter } from "@/app/fonts";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json());

const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Deterministic pastel color for channel initials
const CHANNEL_ACCENTS = [
    { bg: "bg-indigo-50 text-indigo-600 border-indigo-200" },
    { bg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { bg: "bg-sky-50 text-sky-600 border-sky-200" },
    { bg: "bg-amber-50 text-amber-600 border-amber-200" },
    { bg: "bg-rose-50 text-rose-600 border-rose-200" },
    { bg: "bg-violet-50 text-violet-600 border-violet-200" },
];

export default function ChatListSidebar({ activeRoomId }) {
    const { user } = useUser();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { data, error, isLoading, mutate } = useSWR("/api/chat/rooms", fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 10_000,
    });

    const rooms = useMemo(() => {
        if (!data?.rooms || !Array.isArray(data.rooms)) return [];
        return data.rooms;
    }, [data]);

    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const q = searchQuery.toLowerCase().trim();
        return rooms.filter((r) => (r.name || "").toLowerCase().includes(q));
    }, [rooms, searchQuery]);

    const handleCreateChat = async (e) => {
        e.preventDefault();
        const trimmed = newRoomName.trim().replace(/^#\s*/, "").replace(/\s+/g, "-");
        if (!trimmed) {
            toast.error("Please enter a room name");
            return;
        }

        if (!user?.user_id) {
            toast.error("You must be logged in to create a room");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/chat/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimmed,
                    user_id: user.user_id,
                }),
            });

            const result = await res.json();
            if (result.success) {
                toast.success(`Channel #${trimmed} created!`);
                setNewRoomName("");
                setIsModalOpen(false);
                await mutate();
                const id = result.createdChatRoom?.room_id;
                if (id) router.push(`/chats/${id}`);
            } else {
                toast.error(result.message || "Failed to create channel");
            }
        } catch (err) {
            toast.error(err.message || "An error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRoom = async (e, roomId, roomName) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Are you sure you want to delete "#${roomName}"? All messages in this room will be permanently removed.`)) {
            return;
        }

        setDeletingId(roomId);
        try {
            const res = await fetch(`/api/chat/rooms/${roomId}`, {
                method: "DELETE",
            });

            const result = await res.json();
            if (result.success) {
                toast.success(`Channel #${roomName} deleted`);
                await mutate();
                if (String(activeRoomId) === String(roomId)) {
                    router.push("/chats");
                }
            } else {
                toast.error(result.message || "Failed to delete room");
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete channel");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className={`flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white border-r border-zinc-200/80 ${inter.className}`}>
            {/* Sidebar Header */}
            <div className="shrink-0 border-b border-zinc-200/80 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                                Team Channels
                            </h2>
                            <p className="text-[11px] text-zinc-500">
                                {rooms.length} active {rooms.length === 1 ? "room" : "rooms"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 active:scale-95 transition-all"
                        title="Create new channel"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mt-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search channels…"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-1.5 pl-8.5 pr-7 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-400 hover:text-zinc-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Channel List */}
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] divide-y divide-zinc-100">
                {isLoading && (
                    <div className="p-3 space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl animate-pulse">
                                <div className="h-9 w-9 rounded-xl bg-zinc-100 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-3/4 rounded bg-zinc-100" />
                                    <div className="h-2.5 w-1/2 rounded bg-zinc-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 text-center">
                        <p className="text-xs font-semibold text-rose-600">Failed to load channels</p>
                        <button
                            onClick={() => mutate()}
                            className="mt-2 text-xs font-medium text-zinc-600 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !error && filteredRooms.length === 0 && (
                    <div className="p-6 text-center text-zinc-500">
                        <Users className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                        <p className="text-xs font-medium text-zinc-700">No channels found</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                            {searchQuery ? "Try a different search term" : "Create your first team channel"}
                        </p>
                    </div>
                )}

                {!isLoading && !error && (
                    <ul className="p-2 space-y-1">
                        {filteredRooms.map((room, idx) => {
                            const isActive = String(activeRoomId) === String(room.room_id);
                            const accent = CHANNEL_ACCENTS[idx % CHANNEL_ACCENTS.length];
                            const messages = room.messages || [];
                            const lastMsg = messages[messages.length - 1];
                            const lastTime = formatRelativeTime(lastMsg?.createdAt || room.createdAt);

                            return (
                                <li key={room.room_id} className="group relative">
                                    <Link
                                        href={`/chats/${room.room_id}`}
                                        className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all ${
                                            isActive
                                                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-xs"
                                                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                        }`}
                                    >
                                        {/* Channel Icon Badge */}
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${accent.bg}`}
                                        >
                                            <Hash className="h-4 w-4 stroke-[2.2]" />
                                        </div>

                                        <div className="min-w-0 flex-1 pr-6">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="truncate text-xs font-semibold tracking-tight text-zinc-900">
                                                    {room.name}
                                                </p>
                                                {lastTime && (
                                                    <span className="shrink-0 text-[10px] text-zinc-400 font-normal">
                                                        {lastTime}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="truncate text-[11px] text-zinc-500 font-normal leading-snug">
                                                {lastMsg ? (
                                                    <>
                                                        <span className="font-medium text-zinc-700">
                                                            {lastMsg.sender?.name ? `${lastMsg.sender.name.split(" ")[0]}: ` : ""}
                                                        </span>
                                                        {lastMsg.text}
                                                    </>
                                                ) : (
                                                    `Created by ${room.creator?.name || "Team member"}`
                                                )}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteRoom(e, room.room_id, room.name)}
                                        disabled={deletingId === room.room_id}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete channel"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Create Room Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-zinc-950/10">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                                    <Hash className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-900">
                                    Create Channel
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateChat} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                                    Channel Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-xs font-bold text-zinc-400">#</span>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        placeholder="e.g. engineering-sync, design-critique"
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-7 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                    />
                                </div>
                                <p className="mt-1 text-[10px] text-zinc-500">
                                    Use lowercase letters, numbers, and dashes.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {isCreating && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Create Channel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
