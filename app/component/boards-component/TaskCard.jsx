"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Trash2, Edit3, Circle, Calendar, X } from 'lucide-react';
import { inter } from '@/app/fonts';

const PRIORITY_CONFIG = {
    High: { label: 'High', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.25)' },
    Medium: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.25)' },
    Low: { label: 'Low', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.25)' },
};

const DUE_STYLES = {
    overdue: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', border: 'rgba(248, 113, 113, 0.25)', leftAccent: '#f87171' },
    today: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.25)', leftAccent: '#fbbf24' },
    future: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.15)', leftAccent: null },
    none: { color: null, bg: null, border: null, leftAccent: null },
};

export const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);
    const tmrw = new Date(today); tmrw.setDate(tmrw.getDate() + 1);

    if (target.getTime() === today.getTime()) return 'Today';
    if (target.getTime() === tmrw.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const getDueDateStatus = (dateString) => {
    if (!dateString) return 'none';
    const d = new Date(dateString);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);

    if (target < today) return 'overdue';
    if (target.getTime() === today.getTime()) return 'today';
    return 'future';
};

const CardMenu = ({ anchorRef, card, onClose, onEdit, onUpdate }) => {
    const [pos, setPos] = useState(null);

    useEffect(() => {
        const rect = anchorRef.current?.getBoundingClientRect();
        if (!rect) return;
        const MENU_WIDTH = 180;
        setPos({
            top: rect.bottom + 6,
            left: Math.max(8, rect.right - MENU_WIDTH),
        });
    }, [anchorRef]);

    useEffect(() => {
        const close = () => onClose();
        window.addEventListener('scroll', close, { capture: true, passive: true });
        return () => window.removeEventListener('scroll', close, true);
    }, [onClose]);

    const handlePriority = useCallback(async (priority) => {
        try {
            const res = await fetch(`/api/cards/${card.card_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority }),
            });
            const data = await res.json();
            if (data.success) { onUpdate?.(); onClose(); }
        } catch (err) {
            console.error('Priority update error:', err);
        }
    }, [card.card_id, onUpdate, onClose]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${card.title}"?`)) { onClose(); return; }
        fetch(`/api/cards/${card.card_id}`, { method: 'DELETE' })
            .then(r => r.json())
            .then(d => { if (d.success) { onUpdate?.(); onClose(); } })
            .catch(err => console.error('Delete error:', err));
    }, [card.card_id, card.title, onUpdate, onClose]);

    if (!pos) return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-9998"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            />

            <div
                className={`fixed z-9999 w-44 ${inter.className}`}
                style={{ top: pos.top, left: pos.left }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-[#181a20] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-1">
                    <button
                        onClick={() => { onEdit(); onClose(); }}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg transition-colors"
                    >
                        <Edit3 className="h-3.5 w-3.5 text-zinc-400" />
                        Edit Task
                    </button>

                    <div className="h-px bg-zinc-800/80 my-1" />

                    <p className="px-2.5 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                        Set Priority
                    </p>
                    {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => handlePriority(key)}
                            className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Circle size={7} fill={val.color} color={val.color} />
                                {val.label}
                            </span>
                            {card.priority === key && (
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            )}
                        </button>
                    ))}

                    <div className="h-px bg-zinc-800/80 my-1" />

                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Task
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

const TaskCard = React.memo(({ card, index, onCardAdded, onCardClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: card.title,
        description: card.description,
        due_date: card.due_date
    });

    const btnRef = useRef(null);

    const priority = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.Medium;
    const dueDateLabel = formatDueDate(card.due_date);
    const dueDateStatus = getDueDateStatus(card.due_date);
    const dueStyle = DUE_STYLES[dueDateStatus];

    const updateCard = useCallback(async (updates) => {
        try {
            const res = await fetch(`/api/cards/${card.card_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (data.success) { onCardAdded?.(); setIsEditing(false); }
        } catch (err) {
            console.error('Update error:', err);
        }
    }, [card.card_id, onCardAdded]);

    return (
        <>
            <Draggable draggableId={`card-${card.card_id}`} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => !showMenu && onCardClick?.(card)}
                        className={`relative group mb-2 px-3 py-2.5 rounded-xl border select-none transition-all ${
                            snapshot.isDragging
                                ? 'bg-[#222630] border-indigo-500/50 shadow-2xl scale-[1.02]'
                                : 'bg-[#1a1d24] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#1e222b] shadow-xs'
                        }`}
                        style={{
                            ...provided.draggableProps.style,
                            willChange: snapshot.isDragging ? 'transform' : 'auto',
                            borderLeft: !snapshot.isDragging && dueStyle.leftAccent
                                ? `3px solid ${dueStyle.leftAccent}`
                                : undefined,
                        }}
                    >
                        {/* More Menu Trigger */}
                        <div
                            ref={btnRef}
                            className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {showMenu && (
                            <CardMenu
                                anchorRef={btnRef}
                                card={card}
                                onClose={() => setShowMenu(false)}
                                onEdit={() => setIsEditing(true)}
                                onUpdate={onCardAdded}
                            />
                        )}

                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-zinc-100 leading-snug pr-6">
                                {card.title}
                            </p>

                            {card.description && (
                                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                                    {card.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                                        style={{
                                            color: priority.color,
                                            background: priority.bg,
                                            borderColor: priority.border,
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: priority.color }}
                                        />
                                        {priority.label}
                                    </span>

                                    {dueDateLabel && (
                                        <span
                                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border"
                                            style={{
                                                color: dueStyle.color,
                                                background: dueStyle.bg,
                                                borderColor: dueStyle.border,
                                            }}
                                        >
                                            <Calendar className="h-2.5 w-2.5" />
                                            {dueDateLabel}
                                        </span>
                                    )}
                                </div>

                                <span className="text-[10px] text-zinc-600 font-mono">
                                    #{card.card_id}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>

            {/* Edit Task Modal */}
            {isEditing && (
                <div
                    className="fixed inset-0 z-10000 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => setIsEditing(false)}
                    />

                    <div className={`relative w-full max-w-md rounded-2xl bg-[#16191f] border border-zinc-800 p-5 shadow-2xl ${inter.className}`}>
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="text-sm font-semibold text-zinc-100">Edit Task</h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                    Title
                                </label>
                                <input
                                    autoFocus
                                    className="w-full rounded-xl bg-[#111317] border border-zinc-700/80 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-500"
                                    value={editData.title}
                                    onChange={(e) => setEditData(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-xl bg-[#111317] border border-zinc-700/80 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-500 resize-none"
                                    value={editData.description || ''}
                                    onChange={(e) => setEditData(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                    Due Date
                                </label>
                                <div className="relative flex items-center">
                                    <Calendar className="h-3.5 w-3.5 absolute left-3 text-zinc-500 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={editData.due_date ? editData.due_date.split('T')[0] : ""}
                                        onChange={(e) => setEditData(p => ({ ...p, due_date: e.target.value }))}
                                        className="w-full rounded-xl bg-[#111317] border border-zinc-700/80 pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-zinc-800">
                                <button
                                    onClick={() => updateCard(editData)}
                                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 transition-all active:scale-98"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs py-2 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
