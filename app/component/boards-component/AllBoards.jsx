"use client";
import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    ArrowUpRight,
    Trash2,
    Calendar,
    Kanban,
    Layers,
    CheckSquare,
    AlertCircle,
    SlidersHorizontal,
    FolderKanban,
    X,
} from 'lucide-react';
import { inter } from '@/app/fonts';
import CreateNewBoardFormModel from './CreateNewBoardFormModel';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { toast } from 'sonner';

const fetcher = (url) => fetch(url).then((res) => res.json());

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const AllBoards = () => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'tasks' | 'lists'
    const [deletingId, setDeletingId] = useState(null);

    const { data, error, isLoading, mutate } = useSWR('/api/boards', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 30000,
    });

    const rawBoards = useMemo(() => {
        if (!data || !data.boards) return [];
        return Array.isArray(data.boards) ? data.boards : [data.boards];
    }, [data]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        let totalTasks = 0;
        let totalLists = 0;
        let highPriorityTasks = 0;

        rawBoards.forEach((board) => {
            const lists = board.lists || [];
            totalLists += lists.length;
            lists.forEach((list) => {
                const cards = list.cards || [];
                totalTasks += cards.length;
                cards.forEach((card) => {
                    if (card.priority === 'High') {
                        highPriorityTasks += 1;
                    }
                });
            });
        });

        return {
            totalBoards: rawBoards.length,
            totalTasks,
            totalLists,
            highPriorityTasks,
        };
    }, [rawBoards]);

    // Filter and sort boards
    const filteredBoards = useMemo(() => {
        return rawBoards
            .filter((board) => {
                const query = searchQuery.toLowerCase().trim();
                if (!query) return true;
                const name = (board.name || '').toLowerCase();
                const desc = (board.description || '').toLowerCase();
                return name.includes(query) || desc.includes(query);
            })
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return (a.name || '').localeCompare(b.name || '');
                }
                if (sortBy === 'tasks') {
                    const countA = (a.lists || []).reduce((acc, l) => acc + (l.cards?.length || 0), 0);
                    const countB = (b.lists || []).reduce((acc, l) => acc + (l.cards?.length || 0), 0);
                    return countB - countA;
                }
                if (sortBy === 'lists') {
                    const countA = (a.lists || []).length;
                    const countB = (b.lists || []).length;
                    return countB - countA;
                }
                // default recent
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            });
    }, [rawBoards, searchQuery, sortBy]);

    const handleDelete = async (e, boardId, boardTitle) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete "${boardTitle}"? This will delete all columns and tasks.`)) {
            return;
        }

        try {
            setDeletingId(boardId);
            const res = await fetch(`/api/boards/${boardId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to delete board');
            }

            toast.success('Board deleted successfully');
            await mutate();
        } catch (err) {
            toast.error(err.message || 'Failed to delete board');
        } finally {
            setDeletingId(null);
        }
    };

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

            <div className={`min-h-screen bg-zinc-50/70 text-zinc-900 ${inter.className}`}>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-6">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                <span>Workspace</span>
                                <span>/</span>
                                <span className="text-zinc-900 font-semibold">Boards</span>
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                Kanban & Delivery Boards
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-2xl">
                                Visualize workflows, track tasks from backlog to completion, and align cross-functional sprints.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Link
                                href="/projects"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition-colors"
                            >
                                <FolderKanban className="h-3.5 w-3.5 text-zinc-500" />
                                Projects
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-98 transition-all"
                            >
                                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                New Board
                            </button>
                        </div>
                    </div>

                    {/* KPI Quick Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
                            <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[11px] font-semibold uppercase tracking-wider">
                                    Total Boards
                                </span>
                                <Kanban className="h-4 w-4 text-zinc-400" />
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                                {isLoading ? '—' : metrics.totalBoards}
                            </div>
                            <p className="mt-0.5 text-[11px] text-zinc-500">Active workspaces</p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
                            <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[11px] font-semibold uppercase tracking-wider">
                                    Total Tasks
                                </span>
                                <CheckSquare className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                                {isLoading ? '—' : metrics.totalTasks}
                            </div>
                            <p className="mt-0.5 text-[11px] text-zinc-500">Cards across all lists</p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
                            <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[11px] font-semibold uppercase tracking-wider">
                                    Workflow Columns
                                </span>
                                <Layers className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                                {isLoading ? '—' : metrics.totalLists}
                            </div>
                            <p className="mt-0.5 text-[11px] text-zinc-500">Pipeline stages</p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
                            <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[11px] font-semibold uppercase tracking-wider">
                                    High Priority
                                </span>
                                <AlertCircle className="h-4 w-4 text-rose-500" />
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                                {isLoading ? '—' : metrics.highPriorityTasks}
                            </div>
                            <p className="mt-0.5 text-[11px] text-zinc-500">Urgent deliverables</p>
                        </div>
                    </div>

                    {/* Controls: Search and Sort */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search boards by title or description…"
                                className="w-full rounded-xl border border-zinc-200/90 bg-white py-2 pl-9.5 pr-8 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 shadow-xs focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-2 shadow-xs">
                                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                                <span className="text-xs text-zinc-500 font-medium">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-zinc-800 outline-none cursor-pointer"
                                >
                                    <option value="recent">Recently Created</option>
                                    <option value="name">Board Name (A-Z)</option>
                                    <option value="tasks">Most Tasks</option>
                                    <option value="lists">Most Columns</option>
                                </select>
                            </div>

                            <span className="text-xs font-medium text-zinc-500 hidden sm:inline-block">
                                Showing <strong className="text-zinc-900">{filteredBoards.length}</strong> of{' '}
                                {rawBoards.length}
                            </span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((idx) => (
                                <div
                                    key={idx}
                                    className="h-44 rounded-2xl border border-zinc-200/80 bg-white p-5 animate-pulse shadow-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-zinc-100" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-zinc-100" />
                                            <div className="h-3 w-1/2 rounded bg-zinc-100" />
                                        </div>
                                    </div>
                                    <div className="mt-5 space-y-2">
                                        <div className="h-3 w-full rounded bg-zinc-100" />
                                        <div className="h-3 w-4/5 rounded bg-zinc-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center text-rose-800">
                            <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
                            <h3 className="text-sm font-semibold">Unable to load boards</h3>
                            <p className="mt-1 text-xs text-rose-600">{error.message || 'Database connection error'}</p>
                            <button
                                type="button"
                                onClick={() => mutate()}
                                className="mt-4 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Boards Grid */}
                    {!isLoading && !error && (
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredBoards.map((board) => {
                                const lists = board.lists || [];
                                const totalCardCount = lists.reduce(
                                    (acc, list) => acc + (list.cards?.length || 0),
                                    0
                                );
                                const highCardCount = lists.reduce(
                                    (acc, list) =>
                                        acc +
                                        (list.cards?.filter((c) => c.priority === 'High')?.length || 0),
                                    0
                                );
                                const accentColor = board.bg_color || '#4f46e5';

                                return (
                                    <div
                                        key={board.board_id}
                                        onClick={() => router.push(`/board/${board.board_id}`)}
                                        className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        {/* Top Color Accent Line */}
                                        <div
                                            className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl transition-opacity group-hover:h-2"
                                            style={{ backgroundColor: accentColor }}
                                        />

                                        <div>
                                            {/* Card Top Row */}
                                            <div className="flex items-start justify-between gap-3 pt-1">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform group-hover:scale-105"
                                                        style={{ backgroundColor: accentColor }}
                                                    >
                                                        <Kanban className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                                                            {board.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatDate(board.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, board.board_id, board.name)}
                                                    disabled={deletingId === board.board_id}
                                                    className="rounded-lg p-1.5 text-zinc-300 hover:bg-rose-50 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Delete Board"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Description */}
                                            <p className="mt-3 text-xs leading-relaxed text-zinc-500 line-clamp-2 min-h-8">
                                                {board.description || 'No description provided for this board.'}
                                            </p>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-5 border-t border-zinc-100 pt-3.5 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Layers className="h-3.5 w-3.5 text-zinc-400" />
                                                    <span>{lists.length}</span>
                                                    <span className="text-[11px] text-zinc-400">lists</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckSquare className="h-3.5 w-3.5 text-zinc-400" />
                                                    <span>{totalCardCount}</span>
                                                    <span className="text-[11px] text-zinc-400">tasks</span>
                                                </span>
                                                {highCardCount > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200">
                                                        {highCardCount} urgent
                                                    </span>
                                                )}
                                            </div>

                                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                                                Open
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Create New Board Card */}
                            <div
                                onClick={() => setIsModalOpen(true)}
                                className="flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white/50 p-6 text-center hover:border-zinc-400 hover:bg-white transition-all cursor-pointer group"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-xs group-hover:scale-105 group-hover:border-zinc-900 group-hover:text-zinc-900 transition-all">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <h4 className="mt-3 text-xs font-semibold text-zinc-900">
                                    Create New Board
                                </h4>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Add a new sprint or project column workspace
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Zero State if filtered */}
                    {!isLoading && !error && filteredBoards.length === 0 && searchQuery && (
                        <div className="mt-12 text-center py-12 rounded-2xl border border-zinc-200/80 bg-white p-8">
                            <Search className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                            <h3 className="text-sm font-semibold text-zinc-900">No boards found</h3>
                            <p className="mt-1 text-xs text-zinc-500">
                                No board matching &ldquo;{searchQuery}&rdquo;. Try another search term.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                            >
                                Clear search filter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AllBoards;
