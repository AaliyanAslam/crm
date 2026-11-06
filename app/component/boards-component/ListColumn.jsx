"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Trash2, Calendar, Loader2, Plus, X } from "lucide-react";
import { inter } from '@/app/fonts';
import TaskCard from "./TaskCard";

const ListColumn = React.memo(({ list, onCardAdded, onCardClick, animationDelay = 0 }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [visible, setVisible] = useState(false);
    const columnRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), animationDelay);
        return () => clearTimeout(t);
    }, [animationDelay]);

    const handleDeleteList = useCallback(async () => {
        if (!window.confirm(`Delete column "${list.name}" and all its tasks?`)) return;
        try {
            const res = await fetch(`/api/lists/${list.list_id}`, { method: 'DELETE' });
            if (res.ok) {
                onCardAdded();
            } else {
                const d = await res.json();
                alert(d.message || "Failed to delete list");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting list");
        }
    }, [list.list_id, list.name, onCardAdded]);

    const handleAddCard = useCallback(async () => {
        if (!title.trim()) return;
        try {
            setLoading(true);
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    due_date: dueDate || null,
                    list_id: list.list_id,
                    priority: 'Medium',
                    order_index: list.cards?.length ?? 0
                })
            });
            if (res.ok) {
                setLoading(false);
                setTitle("");
                setDescription("");
                setDueDate("");
                setIsAdding(false);
                onCardAdded();
            }
        } catch (err) {
            setLoading(false);
            console.error(err);
        }
    }, [title, description, dueDate, list.list_id, list.cards?.length, onCardAdded]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
        if (e.key === 'Escape') setIsAdding(false);
    }, [handleAddCard]);

    return (
        <div
            ref={columnRef}
            className={`min-w-72 w-72 shrink-0 flex flex-col max-h-[calc(100vh-140px)] rounded-2xl border border-zinc-800/80 bg-[#16191f] shadow-md group/col ${inter.className}`}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(10px)',
                transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
            }}
        >
            {/* Column Header */}
            <div className="flex justify-between items-center px-3.5 pt-3.5 pb-2.5 shrink-0 border-b border-zinc-800/40">
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider truncate">
                        {list.name}
                    </h3>
                    <span className="inline-flex items-center justify-center rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        {list.cards?.length ?? 0}
                    </span>
                </div>

                <button
                    onClick={handleDeleteList}
                    className="opacity-0 group-hover/col:opacity-100 p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Delete column"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Droppable Card Area */}
            <Droppable droppableId={`list-${list.list_id}`} type="CARD">
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-16 transition-colors duration-150"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#27272a transparent',
                            background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.12)' : 'transparent',
                            borderRadius: '12px',
                        }}
                    >
                        {list.cards?.map((card, index) => (
                            <TaskCard
                                key={`card-${card.card_id}`}
                                card={card}
                                index={index}
                                onCardAdded={onCardAdded}
                                onCardClick={onCardClick}
                            />
                        ))}
                        {provided.placeholder}
                        {(!list.cards || list.cards.length === 0) && !snapshot.isDraggingOver && (
                            <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-[11px] font-medium text-zinc-500 select-none">
                                Drop tasks here
                            </div>
                        )}
                    </div>
                )}
            </Droppable>

            {/* Add Card Section */}
            <div className="shrink-0 p-2 border-t border-zinc-800/40">
                {isAdding ? (
                    <div className="rounded-xl p-2.5 space-y-2 border border-zinc-700/80 bg-[#111317]">
                        <textarea
                            autoFocus
                            rows={1}
                            className="w-full rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 bg-[#16191f] border border-zinc-700/60 resize-none outline-none focus:border-indigo-500 placeholder:text-zinc-500"
                            placeholder="Card title…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <textarea
                            rows={2}
                            className="w-full rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 bg-[#16191f] border border-zinc-700/60 resize-none outline-none focus:border-indigo-500 placeholder:text-zinc-500"
                            placeholder="Description (optional)…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <div className="relative flex items-center">
                            <Calendar className="h-3.5 w-3.5 absolute left-2.5 text-zinc-500 pointer-events-none" />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-zinc-300 bg-[#16191f] border border-zinc-700/60 outline-none focus:border-indigo-500 cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div className="flex gap-2 items-center pt-1">
                            <button
                                onClick={handleAddCard}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                                Add card
                            </button>
                            <button
                                onClick={() => { setIsAdding(false); setTitle(""); setDescription(""); setDueDate(""); }}
                                className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-2 py-1 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200 rounded-xl active:scale-[0.99] transition-all"
                    >
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Add a card</span>
                    </button>
                )}
            </div>
        </div>
    );
});

ListColumn.displayName = 'ListColumn';
export default ListColumn;
