"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Trash2, Edit3, Circle, Calendar } from 'lucide-react';
import { urbanist } from '@/app/fonts';


const PRIORITY_CONFIG = {
    High: { label: 'High', color: '#f87168', bg: 'rgba(248,113,104,0.12)' },
    Medium: { label: 'Medium', color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
    Low: { label: 'Low', color: '#4bce97', bg: 'rgba(75,206,151,0.12)' },
};

const DUE_STYLES = {
    overdue: { color: '#f87168', bg: 'rgba(248,113,104,0.1)', border: 'rgba(248,113,104,0.22)', leftAccent: '#f87168' },
    today: { color: '#f5a623', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.22)', leftAccent: '#f5a623' },
    future: { color: '#9fadbc', bg: 'rgba(155,173,188,0.07)', border: 'rgba(155,173,188,0.14)', leftAccent: null },
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
        const MENU_WIDTH = 192; // w-48
        setPos({
            top: rect.bottom + 6,
            left: Math.max(8, rect.right - MENU_WIDTH),
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                className={`fixed z-9999 w-48 ${urbanist.className}`}
                style={{ top: pos.top, left: pos.left }}
                onClick={(e) => e.stopPropagation()}
            >
                <style>{`
                    @keyframes cardMenuIn {
                        from { opacity: 0; transform: scale(0.94) translateY(-6px); }
                        to   { opacity: 1; transform: scale(1)    translateY(0px);  }
                    }
                `}</style>
                <div
                    className="bg-[#1d2125] border border-[#454f59] rounded-xl shadow-2xl overflow-hidden"
                    style={{ animation: 'cardMenuIn 0.12s cubic-bezier(0.22,1,0.36,1) both' }}
                >
                    <div className="p-1">
                        {/* Edit */}
                        <button
                            onClick={() => { onEdit(); onClose(); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#b6c2cf] hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Edit3 size={12} className="text-[#9fadbc]" />
                            Edit Card
                        </button>

                        <div className="h-px bg-[#454f59]/50 my-0.5" />

                        <p className="px-3 py-1.5 text-[9px] font-black text-[#9fadbc]/35 uppercase tracking-widest">
                            Priority
                        </p>
                        {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                            <button
                                key={key}
                                onClick={() => handlePriority(key)}
                                className="flex items-center justify-between w-full px-3 py-2 text-xs text-[#b6c2cf] hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Circle size={8} fill={val.color} color={val.color} />
                                    {val.label}
                                </span>
                                {card.priority === key && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#579dff]" />
                                )}
                            </button>
                        ))}

                        <div className="h-px bg-[#454f59]/50 my-0.5" />

                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#f87168] hover:bg-[#f87168]/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={12} />
                            Delete Card
                        </button>
                    </div>
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

    const btnRef = useRef(null); // anchor for portal menu

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
            <Draggable draggableId={card.card_id.toString()} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => !showMenu && onCardClick?.(card)}
                        className={`
                            relative group mb-1.5 px-3 py-2.5 rounded-lg border
                            select-none transition-colors duration-150
                            ${snapshot.isDragging
                                ? 'bg-[#2c333a] border-[#454f59]/70 shadow-2xl'
                                : 'bg-[#22272b] border-transparent hover:border-[#454f59] hover:shadow-md'
                            }
                        `}
                        style={{
                            ...provided.draggableProps.style,
                            // GPU-composite hint while dragging
                            willChange: snapshot.isDragging ? 'transform' : 'auto',
                            // Subtle left-border urgency accent (hidden while dragging to keep it clean)
                            borderLeft: !snapshot.isDragging && dueStyle.leftAccent
                                ? `2px solid ${dueStyle.leftAccent}`
                                : undefined,
                        }}
                    >
                        <div
                            ref={btnRef}
                            className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                                className={`
                                    p-1.5 rounded-md text-[#9fadbc] hover:bg-white/10
                                    transition-colors duration-100
                                    ${showMenu ? 'bg-white/10 opacity-100' : ''}
                                `}
                            >
                                <MoreHorizontal size={14} />
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

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[#b6c2cf] leading-snug pr-6">
                                {card.title}
                            </p>

                            {card.description && (
                                <p className="text-xs text-[#9fadbc]/55 line-clamp-2 leading-relaxed font-light">
                                    {card.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-0.5 gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">

                                    <span
                                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                        style={{ color: priority.color, background: priority.bg }}
                                    >
                                        <span
                                            className="w-1 h-1 rounded-full"
                                            style={{ background: priority.color }}
                                        />
                                        {priority.label}
                                    </span>

                                    {dueDateLabel && (
                                        <span
                                            className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                                            style={{
                                                color: dueStyle.color,
                                                background: dueStyle.bg,
                                                borderColor: dueStyle.border,
                                            }}
                                        >
                                            <Calendar size={8} />
                                            {dueDateLabel}
                                        </span>
                                    )}
                                </div>

                                <span className="text-[9px] text-[#9fadbc]/20 font-mono tracking-tighter shrink-0">
                                    #{card.card_id}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>

            {isEditing && (
                <div
                    className="fixed inset-0 z-10000 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
                        onClick={() => setIsEditing(false)}
                    />

                    <div className="relative w-full max-w-md bg-[#22272b] border border-[#454f59] rounded-xl shadow-2xl overflow-hidden">
                        <div
                            className="h-0.5 w-full"
                            style={{ background: 'linear-gradient(90deg, #579dff 0%, #4bce97 100%)' }}
                        />
                        <div className="px-2 py-3  space-y-4">
                            <h3 className="text-sm font-bold text-[#b6c2cf]">Edit Task</h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[9px] font-black text-[#9fadbc]/35 uppercase tracking-widest mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        autoFocus
                                        className="
                                            w-full bg-[#1d2125] border border-[#454f59] rounded-lg
                                            px-3 py-2 text-sm text-[#b6c2cf] outline-none
                                            focus:border-[#579dff]/50 transition-colors
                                        "
                                        value={editData.title}
                                        onChange={(e) => setEditData(p => ({ ...p, title: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-[#9fadbc]/35 uppercase tracking-widest mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="
                                            w-full bg-[#1d2125] border border-[#454f59] rounded-lg
                                            px-3 py-2 text-sm text-[#b6c2cf] outline-none
                                            focus:border-[#579dff]/50 transition-colors resize-none
                                        "
                                        value={editData.description || ''}
                                        onChange={(e) => setEditData(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                                <div>

                                    <label className="block text-[9px] font-black text-[#9fadbc]/35 uppercase tracking-widest mb-1.5">
                                        Due Date
                                    </label>
                                   <div className='flex justify-center items-center'>
                                     <Calendar size={14} className="ml-2 absolute left-2.5 text-[#9fadbc]/50 pointer-events-none" />

                                    <input
                                        type="date"
                                        value={editData.due_date ? editData.due_date.split('T')[0] : ""}
                                        onChange={(e) => setEditData(p => ({ ...p, due_date: e.target.value }))}
                                        className="w-full rounded-md pl-9 pr-2.5 py-1.5 text-[11px] text-[#b6c2cf] outline-none ring-1 ring-[#454f59] focus:ring-2 focus:ring-[#579dff]/50 appearance-none bg-[#1d2125] cursor-pointer transition-all"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                   </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => updateCard(editData)}
                                        className="
                                            flex-1 bg-[#579dff] hover:bg-[#4c8be0]
                                            text-[#1d2125] font-bold text-xs py-2 rounded-lg
                                            transition-all active:scale-95
                                        "
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="
                                            flex-1 bg-[#2c333a] hover:bg-[#343c44]
                                            text-[#9fadbc] font-bold text-xs py-2 rounded-lg
                                            transition-colors
                                        "
                                    >
                                        Cancel
                                    </button>
                                </div>
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