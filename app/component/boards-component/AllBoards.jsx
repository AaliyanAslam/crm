"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Layers, Plus, ArrowRight, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { urbanist } from '@/app/fonts'
import { MdOutlineDeleteOutline } from "react-icons/md";
import CreateNewBoardFormModel from './CreateNewBoardFormModel'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import { toast } from 'sonner'


const fetcher = (url) => fetch(url).then((res) => res.json());


const AllBoards = () => {
    const [boards, setBoards] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()
    const headerRef = useRef(null)
    const gridRef = useRef(null)
    const cardsRef = useRef([])

    const { data, error: swrError, isLoading: swrLoading, mutate } = useSWR('/api/boards', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    })




    const formatDateTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleDelete = async (boardId) => {
        if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
            return;
        }
        try {
            const res = await fetch(`/api/boards/${boardId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Board deleted successfully!");
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete board');
            }
            try { await mutate(); } catch (e) { setBoards(prev => prev.filter(board => board.board_id !== boardId)); }
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.message || "An error occurred while deleting the board.");
        }
    }

    useEffect(() => {
        if (swrLoading) {
            setLoading(true)
            return
        }

        if (swrError) {
            setError(swrError.message || 'Failed to fetch boards')
            setLoading(false)
            return
        }

        if (data) {
            if (data.success) {
                setBoards(data.boards || (data.board ? [data.board] : []))
                setError(null)
            } else {
                setError(data.message || 'Failed to fetch boards')
            }
            setLoading(false)
        }
    }, [data, swrError, swrLoading])

    useEffect(() => {
        if (!loading && boards.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(headerRef.current,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
                )

                gsap.fromTo(cardsRef.current,
                    { opacity: 0, y: 40, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.55,
                        stagger: 0.08,
                        ease: "back.out(1.2)",
                        delay: 0.2
                    }
                )
            })

            return () => ctx.revert()
        }
    }, [loading, boards])

    const handleCardHover = (index, isEntering) => {
        const card = cardsRef.current[index]
        if (!card) return

        gsap.to(card, {
            scale: isEntering ? 1.02 : 1,
            y: isEntering ? -4 : 0,
            duration: 0.35,
            ease: "power2.out"
        })

        const inner = card.querySelector('.inner-card')
        if (!inner) return

        gsap.to(inner, {
            boxShadow: isEntering
                ? "0 16px 32px -8px rgba(0,0,0,0.12)"
                : "0 4px 6px -1px rgba(0,0,0,0.05)",
            duration: 0.35
        })
    }

    if (loading) return (
        <div className={`min-h-[50vh] bg-neutral-50 flex items-center justify-center py-8 ${urbanist.className}`}>
            <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                <span className="text-xs text-neutral-500 tracking-wide">Loading workspace…</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-[50vh] bg-neutral-50 flex items-center justify-center p-4 sm:p-6">
            <div className="text-center max-w-sm">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-red-900 mb-1">Something went wrong</h3>
                <p className="text-red-600/80 text-xs sm:text-sm">{error}</p>
            </div>
        </div>
    )

    return (
        <>
            <CreateNewBoardFormModel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={async () => {
                    await mutate();
                    setIsModalOpen(false);
                }}
            />

            <div className={`min-h-screen bg-[#ebf5f7] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-7 lg:px-8 lg:py-8 font-sans selection:bg-neutral-900 selection:text-white ${urbanist.className}`}>
                <div className="max-w-7xl mx-auto w-full min-w-0">
                    <header ref={headerRef} className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6 md:mb-8 opacity-0">
                        <div className="space-y-2 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                Workspace
                            </div>
                            <div className="flex flex-wrap items-center gap-2 gap-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight bg-linear-to-r from-[#3d9ca8] to-[#128fa0] bg-clip-text text-transparent">
                                    Your boards
                                </h1>
                                <Link
                                    href="/chats"
                                    className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                                >
                                    Chat
                                </Link>
                            </div>
                            <p className="text-neutral-500 text-sm md:text-base max-w-md leading-snug">
                                Ideas, tasks, and everything that matters — in one place.
                            </p>
                        </div>

                        <div className="flex bg-white p-3 rounded-xl border-2 border-[#3d9ca8]/80 items-center justify-between gap-3 shrink-0 w-full md:w-auto">
                            <div className="text-right min-w-0">
                                <div className="text-start text-3xl sm:text-4xl font-bold text-[#128fa0] tabular-nums leading-none">
                                    {boards.length}
                                </div>
                                <div className="text-xs font-semibold text-neutral-800 uppercase mt-1 tracking-wide">
                                    Active boards
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="hidden md:inline-flex items-center gap-1.5 bg-[#49bac9] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#3aa8b7] transition-colors active:scale-95 shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New board
                            </button>
                        </div>
                    </header>

                    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                        {boards.map((board, index) => (
                            <div
                                key={board.board_id}
                                ref={el => cardsRef.current[index] = el}
                                onMouseEnter={() => handleCardHover(index, true)}
                                onMouseLeave={() => handleCardHover(index, false)}
                                className="group relative cursor-pointer opacity-0 perspective-1000"
                                onClick={() => router.push(`/board/${board.board_id}`)}
                            >
                                <div className="relative aspect-16/10 rounded-2xl p-2.5 sm:p-3 transition-all duration-400 ease-out group-hover:-translate-y-1">

                                    <div
                                        className="absolute inset-0 rounded-2xl transition-transform duration-400 group-hover:scale-[1.01] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                                        style={{ backgroundColor: board.bg_color || '#57C9D8' }}
                                    >
                                        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/20 rounded-full blur-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(board.board_id);
                                        }}
                                        className="absolute top-1.5 right-4 z-30 p-1 rounded-lg bg-white/25 backdrop-blur-md text-white border border-red-200/60 hover:bg-red-500 hover:border-red-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
                                        title="Delete board"
                                    >
                                        <MdOutlineDeleteOutline size={17} />
                                    </button>

                                    <div className="inner-card relative h-full w-full bg-white/75 backdrop-blur-xl rounded-[18px] p-4 sm:p-4 shadow-[0_6px_24px_0_rgba(31,38,135,0.06)] border border-white/60 flex flex-col justify-between overflow-hidden">

                                        <div className="absolute -inset-full top-0 block w-1/2 h-full z-5 bg-linear-to-r from-transparent via-white/35 to-transparent -skew-x-12 group-hover:animate-shine" />

                                        <div className="flex justify-between items-start gap-2 z-10 min-w-0">
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <h2 className="text-lg sm:text-xl font-bold text-neutral-800 tracking-tight leading-tight line-clamp-2">
                                                    {board.name}
                                                </h2>
                                                {board.description ? (
                                                    <p className="text-[11px] font-medium text-neutral-500/90 line-clamp-2 leading-snug max-w-56">
                                                        {board.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] italic text-neutral-400">No description</p>
                                                )}
                                            </div>

                                            <div
                                                style={{ "--hover-color": board?.bg_color }}
                                                className={`
    w-10 h-10 shrink-0 rounded-xl bg-neutral-50 border border-neutral-100 
    flex items-center justify-center 
    duration-400 shadow-sm
    group-hover:bg-(--hover-color)
    group-hover:text-white 
    group-hover:border-(--hover-color)
  `}
                                            >
                                                <Layers className="w-4 h-4" strokeWidth={1.8} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 z-10 mt-4 min-w-0">
                                            <div className="min-w-0">
                                                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                                                    Activity
                                                </span>
                                                <span
                                                    className="text-[11px] font-semibold text-neutral-600 cursor-help line-clamp-1"
                                                    title={formatDateTime(board.created_at)}
                                                >
                                                    {formatDateTime(board.created_at)}
                                                </span>
                                            </div>

                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-[11px] font-bold shadow-md shadow-neutral-900/10 shrink-0 pointer-events-none">
                                                Open
                                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="group relative cursor-pointer opacity-0"
                            ref={el => cardsRef.current[boards.length] = el}
                        >
                            <div className="aspect-16/10 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-[#1fd6ee] hover:shadow-lg hover:shadow-[#1fd6ee]/10 flex flex-col items-center justify-center gap-2.5 py-6 transition-all duration-400 group-hover:-translate-y-0.5">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-neutral-200/40 flex items-center justify-center group-hover:scale-105 border border-neutral-100 transition-transform">
                                    <Plus className="w-6 h-6 text-[#49bac9]" strokeWidth={2.25} />
                                </div>
                                <div className="text-center px-2">
                                    <span className="block text-xs font-bold text-neutral-800">Create new board</span>
                                    <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wider">Add to workspace</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!boards.length && (
                        <div className="text-center py-12 sm:py-14">
                            <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Layers className="w-7 h-7 text-neutral-300" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 mb-1">No boards yet</h3>
                            <p className="text-neutral-500 text-sm mb-4">Create your first board to get started</p>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Create board
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default AllBoards
