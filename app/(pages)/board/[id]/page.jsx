"use client"

import React, { useState, useCallback } from 'react'
import { useParams } from "next/navigation";
import useSWR from 'swr';
import { urbanist } from "@/app/fonts";
import BoardContainer from "@/app/component/boards-component/BoardContainer";
import CommentSidebar from '@/app/component/boards-component/CommentSidebar';

// 1. Fetcher function: SWR ka worker jo API se data layega
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BoardPage() {
    const params = useParams();
    const id = params?.id;

    // Sidebar states: Track karne ke liye ke kaunsa card khula hai
    const [selectedCard, setSelectedCard] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 2. SWR Hook: Board ka sara data fetch aur cache karne ke liye
    // Key: `/api/boards/${id}`
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/boards/${id}` : null,
        fetcher,
        {
            revalidateOnFocus: false, // Window change par baar baar fetch na ho
            dedupingInterval: 10000,  // 10 seconds tak cache fresh maana jaye
        }
    );

    // Card click handler: Jab user kisi card par click kare
    const handleCardClick = useCallback((card) => {
        setSelectedCard(card);
        setIsSidebarOpen(true);
    }, []);

    // Board data extraction
    const board = data?.board;
    const totalCards = board?.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0) ?? 0;

    // Loading State (SWR handled)
    if (isLoading) {
        return (
            <div className={`${urbanist.className} flex min-h-0 flex-1 min-w-0 w-full max-w-full items-center justify-center bg-[#1d2125]`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-2 border-[#579dff]/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#579dff] animate-spin" />
                    </div>
                    <p className="text-[#9fadbc] text-[10px] font-bold tracking-[0.3em] uppercase">
                        Refining Workspace…
                    </p>
                </div>
            </div>
        );
    }

    // Error State (SWR handled)
    if (error || !board) {
        return (
            <div className={`${urbanist.className} flex min-h-0 flex-1 min-w-0 w-full max-w-full items-center justify-center bg-[#1d2125]`}>
                <div className="text-center space-y-4">
                    <div className="text-5xl">🍵</div>
                    <h2 className="text-xl font-bold text-[#b6c2cf]">Board Not Found</h2>
                    <p className="text-[#9fadbc] text-sm">{data?.message || "Failed to connect to server"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${urbanist.className} flex min-h-0 flex-1 min-w-0 w-full max-w-full flex-col overflow-hidden overflow-x-clip bg-[#1d2125] text-[#b6c2cf]`}>
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">

                {/* Premium Header */}
                <header className="shrink-0 border-b border-white/5 bg-[#1d2125]/80 px-4 pb-4 pt-4 backdrop-blur-xl sm:px-6 sm:pb-5 sm:pt-6 md:px-28 md:pb-6 md:pt-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-x-6 sm:gap-y-3">
                        <div className="min-w-0 space-y-1.5">
                            <div className="flex min-w-0 items-center gap-2 text-[9px] font-black tracking-[0.2em] text-[#579dff]/70 uppercase sm:tracking-[0.3em]">
                                <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#579dff] animate-pulse" />
                                <span className="min-w-0 truncate">Interactive CRM Board</span>
                            </div>
                            <h1 className="wrap-break-word text-2xl font-bold tracking-tight text-[#b6c2cf] sm:text-3xl">
                                {board.name}
                            </h1>
                            {board.description && (
                                <p className="max-w-xl text-sm font-medium italic leading-snug text-[#9fadbc] line-clamp-2 opacity-70 sm:line-clamp-1">
                                    {board.description}
                                </p>
                            )}
                        </div>

                        {/* Real-time Stats — shrink-0 + nowrap so the row never collapses */}
                        <div className="flex shrink-0 items-center justify-start gap-5 border-t border-white/5 pt-3 sm:justify-end sm:border-t-0 sm:pt-0 sm:pb-1">
                            <div className="text-left sm:text-right">
                                <p className="tabular-nums text-xl font-light leading-none text-[#b6c2cf] sm:text-2xl">
                                    {board.lists?.length || 0}
                                </p>
                                <p className="mt-1 whitespace-nowrap text-[9px] font-black uppercase tracking-wide text-[#9fadbc]/50 sm:tracking-widest">
                                    Lists
                                </p>
                            </div>
                            <div className="h-8 w-px shrink-0 bg-white/10" aria-hidden />
                            <div className="text-left sm:text-right">
                                <p className="tabular-nums text-xl font-light leading-none text-[#b6c2cf] sm:text-2xl">
                                    {totalCards}
                                </p>
                                <p className="mt-1 whitespace-nowrap text-[9px] font-black uppercase tracking-wide text-[#9fadbc]/50 sm:tracking-widest">
                                    <span className="sm:hidden">Cards</span>
                                    <span className="hidden sm:inline">Total cards</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Board Area */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    <BoardContainer
                        lists={board.lists}
                        boardId={board.board_id}
                        onUpdate={mutate} // ✨ Mutate pass kiya taake refresh ho sakay
                        onCardClick={handleCardClick} // ✨ Card click handle karne ke liye
                    />
                </div>
            </main>

            {/* 🚀 Comment Sidebar: Dynamic data ke saath */}
            <CommentSidebar 
                card={selectedCard} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
        </div>
    );
}