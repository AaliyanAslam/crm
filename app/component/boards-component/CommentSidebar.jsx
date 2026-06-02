"use client"
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import {
    X,
    MessageSquare,
    Send,
    Loader2,
    Clock,
    Trash2,
    Pencil,
    Check,
    XCircle,
    FileText,
} from 'lucide-react';

const COLORS = {
    bg: '#1c1f24',
    panel: '#20242a',
    surface: '#24292f',
    border: '#2f363d',
    textPrimary: '#e6edf3',
    textSecondary: '#9da7b3',
    accent: '#4f8cff',
    danger: '#f87171',
};

const PRIORITY_STYLES = {
    High: { color: '#f87171', background: 'rgba(248, 113, 113, 0.14)' },
    Medium: { color: '#f5a623', background: 'rgba(245, 166, 35, 0.14)' },
    Low: { color: '#4bce97', background: 'rgba(75, 206, 151, 0.14)' },
};

const DUE_DATE_COLORS = {
    overdue: '#f87171',
    today: '#f5a623',
    future: '#9da7b3',
    none: '#9da7b3',
};

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_PART_REGEX = /^https?:\/\/[^\s]+$/;
const fetcher = (url) => fetch(url).then((r) => r.json());
const scrollClass = "[scrollbar-width:thin] [scrollbar-color:#2f363d_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2f363d] scroll-smooth";

const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (target.getTime() === today.getTime()) return 'Today';
    if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const getDueDateStatus = (dateString) => {
    if (!dateString) return 'none';
    const d = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    if (target < today) return 'overdue';
    if (target.getTime() === today.getTime()) return 'today';
    return 'future';
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const renderLinkedText = (text) => {
    if (!text) return null;
    const parts = text.split(URL_REGEX);

    return parts.map((part, index) => {
        if (URL_PART_REGEX.test(part)) {
            return (
                <a
                    key={`${part}-${index}`}
                    href={part}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline decoration-transparent transition-colors duration-200 hover:decoration-current"
                    style={{ color: COLORS.accent }}
                >
                    {part}
                </a>
            );
        }

        return (
            <React.Fragment key={`${part}-${index}`}>
                {part}
            </React.Fragment>
        );
    });
};

const RichText = ({ text, className = "" }) => (
    <p className={className} style={{ color: COLORS.textPrimary }}>
        {String(text || '').split('\n').map((line, lineIndex) => (
            <React.Fragment key={`line-${lineIndex}`}>
                {renderLinkedText(line)}
                {lineIndex < String(text || '').split('\n').length - 1 ? <br /> : null}
            </React.Fragment>
        ))}
    </p>
);

const SectionHeader = ({ icon: Icon, title, count, action }) => (
    <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
            <Icon size={15} style={{ color: COLORS.textSecondary }} />
            <h3 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                {title}
            </h3>
            {typeof count === 'number' && (
                <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textSecondary }}
                >
                    {count}
                </span>
            )}
        </div>
        {action}
    </div>
);

const GhostActionButtons = ({ onEdit, onDelete }) => (
    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-[#9da7b3] transition-all duration-200 hover:bg-white/5 hover:text-[#4f8cff] active:scale-95"
        >
            <Pencil size={13} />
        </button>
        <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-[#9da7b3] transition-all duration-200 hover:bg-white/5 hover:text-[#f87171] active:scale-95"
        >
            <Trash2 size={13} />
        </button>
    </div>
);

const InlineEditor = ({ value, onChange, onCancel, onSave, isSubmitting }) => (
    <div className="space-y-3">
        <textarea
            autoFocus
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-2xl border px-4 py-3 text-[15px] leading-6 outline-none transition-all duration-200"
            style={{
                backgroundColor: COLORS.bg,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
                boxShadow: `0 0 0 1px ${COLORS.accent} inset`,
            }}
        />
        <div className="flex items-center justify-end gap-2">
            <button
                type="button"
                onClick={onCancel}
                className="rounded-lg p-2 text-[#9da7b3] transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-95"
            >
                <XCircle size={16} />
            </button>
            <button
                type="button"
                disabled={isSubmitting || !value.trim()}
                onClick={onSave}
                className="rounded-lg p-2 text-[#4f8cff] transition-all duration-200 hover:bg-white/5 hover:text-[#79a7ff] active:scale-95 disabled:opacity-40"
            >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
        </div>
    </div>
);

const InputBox = ({
    value,
    onChange,
    onSubmit,
    onKeyDown,
    placeholder,
    buttonLabel,
    disabled,
    rows = 3,
}) => (
    <form onSubmit={onSubmit}>
        <div
            className="overflow-hidden rounded-2xl border transition-all duration-200 focus-within:shadow-[0_0_0_1px_#4f8cff]"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full resize-none border-none px-4 py-4 text-[15px] leading-6 outline-none placeholder:text-[#6f7a86]"
                style={{ backgroundColor: COLORS.bg, color: COLORS.textPrimary }}
            />
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: COLORS.surface, borderTop: `1px solid ${COLORS.border}` }}
            >
                <span className="text-[11px]" style={{ color: COLORS.textSecondary }}>
                    Ctrl/Cmd + Enter
                </span>
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-40"
                    style={{ backgroundColor: COLORS.accent }}
                >
                    {disabled ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {buttonLabel}
                </button>
            </div>
        </div>
    </form>
);

const DescriptionItem = ({
    item,
    isEditing,
    editText,
    setEditText,
    setEditing,
    onDelete,
    onSave,
    isSubmitting,
}) => (
    <div className="group rounded-2xl">
        {isEditing ? (
            <InlineEditor
                value={editText}
                onChange={setEditText}
                onCancel={() => setEditing(null)}
                onSave={onSave}
                isSubmitting={isSubmitting}
            />
        ) : (
            <div
                className="relative rounded-2xl px-4 py-4 pr-24 transition-all duration-200 hover:bg-[#2a3037]"
                style={{ backgroundColor: COLORS.surface }}
            >
                <div className="absolute right-3 top-3 flex items-center gap-2">
                    <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                        {formatDateTime(item.createdAt)}
                    </span>
                    <GhostActionButtons
                        onEdit={() => {
                            setEditing(item.description_id);
                            setEditText(item.text);
                        }}
                        onDelete={() => onDelete(item.description_id)}
                    />
                </div>
                <RichText text={item.text} className="pr-2 text-[15px] leading-6 whitespace-pre-wrap" />
            </div>
        )}
    </div>
);

const CommentItem = ({
    item,
    isEditing,
    editText,
    setEditText,
    setEditing,
    onDelete,
    onSave,
    isSubmitting,
}) => (
    <div className="group flex gap-3">
        <div
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(79, 140, 255, 0.12)', color: COLORS.accent }}
        >
            {item.author_name?.[0] || 'G'}
        </div>
        <div className="min-w-0 flex-1">
            {isEditing ? (
                <InlineEditor
                    value={editText}
                    onChange={setEditText}
                    onCancel={() => setEditing(null)}
                    onSave={onSave}
                    isSubmitting={isSubmitting}
                />
            ) : (
                <div
                    className="relative rounded-2xl px-4 py-4 pr-24 transition-all duration-200 hover:bg-[#2a3037]"
                    style={{ backgroundColor: COLORS.surface }}
                >
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                            Guest
                        </span>
                    </div>
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                        <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                            {formatDateTime(item.createdAt)}
                        </span>
                        <GhostActionButtons
                            onEdit={() => {
                                setEditing(item.comment_id);
                                setEditText(item.text);
                            }}
                            onDelete={() => onDelete(item.comment_id)}
                        />
                    </div>
                    <RichText text={item.text} className="text-[15px] leading-6 whitespace-pre-wrap" />
                </div>
            )}
        </div>
    </div>
);

const MetaPill = ({ children, style }) => (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={style}>
        {children}
    </span>
);

const CloseButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label="Close details"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[#9da7b3] transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-95"
        style={{ borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
        <X size={18} />
    </button>
);

const CommentSidebar = ({ card, isOpen, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [descriptionText, setDescriptionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentEditingId, setCommentEditingId] = useState(null);
    const [descriptionEditingId, setDescriptionEditingId] = useState(null);
    const [commentEditText, setCommentEditText] = useState('');
    const [descriptionEditText, setDescriptionEditText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setCommentText('');
            setDescriptionText('');
            setCommentEditingId(null);
            setDescriptionEditingId(null);
            setCommentEditText('');
            setDescriptionEditText('');
        }
    }, [isOpen, card?.card_id]);

    const { data, mutate, isLoading } = useSWR(
        isOpen && card?.card_id ? `/api/cards/${card.card_id}/comments` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    );

    const { data: desData, mutate: mutateDes, isLoading: isLoadingDescriptions } = useSWR(
        isOpen && card?.card_id ? `/api/cards/${card.card_id}/descriptions` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    );

    if (!card) return null;

    const comments = data?.comments ?? [];
    const descriptions = desData?.descriptions ?? [];
    const priorityStyle = PRIORITY_STYLES[card.priority] ?? PRIORITY_STYLES.Medium;
    const dueDateLabel = formatDueDate(card.due_date);
    const dueDateStatus = getDueDateStatus(card.due_date);
    const dueDateColor = DUE_DATE_COLORS[dueDateStatus];

    const handleKeyDown = (e, submitFn) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            submitFn(e);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/cards/${card.card_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText }),
            });
            if (res.ok) {
                setCommentText('');
                mutate();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostDescription = async (e) => {
        e.preventDefault();
        if (!descriptionText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/cards/${card.card_id}/descriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: descriptionText }),
            });
            if (res.ok) {
                setDescriptionText('');
                mutateDes();
            }
        } catch (err) {
            console.error('Post description failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm("Delete this comment?")) return;
        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) mutate();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleDeleteDescription = async (descriptionId) => {
        if (!confirm("Delete this description?")) return;
        try {
            const res = await fetch(`/api/descriptions/${descriptionId}`, { method: 'DELETE' });
            if (res.ok) mutateDes();
        } catch (err) {
            console.error('Delete description failed:', err);
        }
    };

    const handleUpdate = async (commentId) => {
        if (!commentEditText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentEditText }),
            });
            if (res.ok) {
                setCommentEditingId(null);
                setCommentEditText('');
                mutate();
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateDescription = async (descriptionId) => {
        if (!descriptionEditText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/descriptions/${descriptionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: descriptionEditText }),
            });
            if (res.ok) {
                setDescriptionEditingId(null);
                setDescriptionEditText('');
                mutateDes();
            }
        } catch (err) {
            console.error('Update description failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 transition-all duration-200 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-0 p-2 sm:p-4 lg:p-6">
                <div
                    className={`mx-auto grid h-full max-w-7xl grid-cols-1 overflow-hidden rounded-[24px] border shadow-2xl transition-all duration-200 md:grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_420px] ${scrollClass} ${isOpen ? 'scale-100' : 'scale-[0.98]'}`}
                    style={{
                        backgroundColor: COLORS.panel,
                        borderColor: COLORS.border,
                        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.45)',
                    }}
                >
                    <section className={`min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6 ${scrollClass}`}>
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <MetaPill style={priorityStyle}>
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: priorityStyle.color }} />
                                        {card.priority || 'Medium'}
                                    </MetaPill>
                                    {dueDateLabel && (
                                        <MetaPill style={{ color: dueDateColor, background: 'rgba(255,255,255,0.05)' }}>
                                            <Clock size={13} />
                                            {dueDateLabel}
                                            {dueDateStatus === 'overdue' ? ' · Overdue' : ''}
                                        </MetaPill>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-[30px]" style={{ color: COLORS.textPrimary }}>
                                        {card.title}
                                    </h2>
                                    {card.description ? (
                                        <RichText
                                            text={card.description}
                                            className="text-[15px] leading-7 whitespace-pre-wrap"
                                        />
                                    ) : null}
                                </div>
                            </div>

                            <CloseButton onClick={onClose} />
                        </div>

                        <div className="mt-6 space-y-4 sm:mt-7 sm:space-y-5">
                            <SectionHeader icon={FileText} title="Description" count={descriptions.length} />
                            <InputBox
                                value={descriptionText}
                                onChange={setDescriptionText}
                                onSubmit={handlePostDescription}
                                onKeyDown={(e) => handleKeyDown(e, handlePostDescription)}
                                placeholder="Add a more detailed description..."
                                buttonLabel="Save"
                                disabled={isSubmitting}
                                rows={4}
                            />

                            <div className="space-y-3 sm:space-y-4">
                                {isLoadingDescriptions ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 size={18} className="animate-spin" style={{ color: COLORS.accent }} />
                                    </div>
                                ) : descriptions.length === 0 ? (
                                    <div
                                        className="rounded-2xl px-4 py-5 text-sm"
                                        style={{ backgroundColor: COLORS.surface, color: COLORS.textSecondary }}
                                    >
                                        No descriptions yet
                                    </div>
                                ) : (
                                    descriptions.map((desc) => (
                                        <DescriptionItem
                                            key={desc.description_id}
                                            item={desc}
                                            isEditing={descriptionEditingId === desc.description_id}
                                            editText={descriptionEditText}
                                            setEditText={setDescriptionEditText}
                                            setEditing={setDescriptionEditingId}
                                            onDelete={handleDeleteDescription}
                                            onSave={() => handleUpdateDescription(desc.description_id)}
                                            isSubmitting={isSubmitting}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    <aside
                        className={`min-h-0 overflow-y-auto border-t p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6 ${scrollClass}`}
                        style={{ backgroundColor: '#1b1f24', borderColor: COLORS.border }}
                    >
                        <div className="space-y-4 sm:space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <SectionHeader
                                    icon={MessageSquare}
                                    title="Comments and activity"
                                    count={comments.length}
                                />
                                <div className="lg:hidden">
                                    <CloseButton onClick={onClose} />
                                </div>
                            </div>

                            <InputBox
                                value={commentText}
                                onChange={setCommentText}
                                onSubmit={handlePost}
                                onKeyDown={(e) => handleKeyDown(e, handlePost)}
                                placeholder="Write a comment..."
                                buttonLabel="Post"
                                disabled={isSubmitting}
                                rows={3}
                            />

                            <div className="space-y-3 sm:space-y-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 size={18} className="animate-spin" style={{ color: COLORS.accent }} />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div
                                        className="rounded-2xl px-4 py-5 text-sm"
                                        style={{ backgroundColor: COLORS.surface, color: COLORS.textSecondary }}
                                    >
                                        No comments yet
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <CommentItem
                                            key={comment.comment_id}
                                            item={comment}
                                            isEditing={commentEditingId === comment.comment_id}
                                            editText={commentEditText}
                                            setEditText={setCommentEditText}
                                            setEditing={setCommentEditingId}
                                            onDelete={handleDelete}
                                            onSave={() => handleUpdate(comment.comment_id)}
                                            isSubmitting={isSubmitting}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CommentSidebar;