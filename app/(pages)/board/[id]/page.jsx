"use client";

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from "next/navigation";
import useSWR from 'swr';
import { inter } from "@/app/fonts";
import BoardContainer from "@/app/component/boards-component/BoardContainer";
import CommentSidebar from '@/app/component/boards-component/CommentSidebar';
import { ArrowLeft, Kanban, Layers, CheckSquare, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BoardPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [selectedCard, setSelectedCard] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { data, error, isLoading, mutate, isValidating } = useSWR(
        id ? `/api/boards/${id}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    const handleCardClick = useCallback((card) => {
        setSelectedCard(card);
        setIsSidebarOpen(true);
    }, []);

    const board = data?.board;
    const totalCards = board?.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0) ?? 0;
    const accentColor = board?.bg_color || '#4f46e5';

    // Loading State
    if (isLoading) {
        return (
            <div className={`${inter.className} flex min-h-[70vh] flex-1 items-center justify-center bg-zinc-950 text-zinc-300`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="relative h-9 w-9">
                        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
                    </div>
                    <p className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
                        Loading board…
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !board) {
        return (
            <div className={`${inter.className} flex min-h-[70vh] flex-1 items-center justify-center bg-zinc-950 text-zinc-300 p-6`}>
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Kanban className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-100">Board Not Found</h2>
                        <p className="mt-1 text-xs text-zinc-500">{data?.message || "We could not find the requested board."}</p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                        <Link
                            href="/boards"
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Boards
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${inter.className} flex min-h-screen flex-1 flex-col overflow-hidden bg-[#111317] text-zinc-200`}>
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                {/* Modern Header */}
                <header className="shrink-0 border-b border-zinc-800/80 bg-[#16191f]/95 px-4 py-3.5 backdrop-blur-md sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left: Back button + Board Name & Description */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={() => router.push('/boards')}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                                title="Back to All Boards"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>

                            <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
                                style={{ backgroundColor: accentColor }}
                            >
                                <Kanban className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="truncate text-base sm:text-lg font-bold text-zinc-100">
                                        {board.name}
                                    </h1>
                                    <span
                                        className="h-2 w-2 rounded-full shrink-0"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </div>
                                {board.description && (
                                    <p className="truncate text-xs text-zinc-400 max-w-xl">
                                        {board.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: Board Stats & Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t border-zinc-800/60 pt-2 sm:border-t-0 sm:pt-0">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300">
                                    <Layers className="h-3.5 w-3.5 text-zinc-400" />
                                    <strong className="text-zinc-100 font-semibold">{board.lists?.length || 0}</strong>
                                    <span className="text-[11px] text-zinc-500">lists</span>
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300">
                                    <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                                    <strong className="text-zinc-100 font-semibold">{totalCards}</strong>
                                    <span className="text-[11px] text-zinc-500">tasks</span>
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => mutate()}
                                disabled={isValidating}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50"
                                title="Sync Board"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? 'animate-spin text-indigo-400' : ''}`} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Drag-and-drop Board Container */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    <BoardContainer
                        lists={board.lists}
                        boardId={board.board_id}
                        onUpdate={mutate}
                        onCardClick={handleCardClick}
                    />
                </div>
            </main>

            {/* Comment & Detail Sidebar */}
            <CommentSidebar
                card={selectedCard}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}
