"use client";

import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
    useCallback,
    Fragment,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useSocket } from "@/app/hooks/useSocket";
import { useUser } from "@/app/hooks/useUser";
import { useChatMessageNotifications } from "@/app/hooks/useChatMessageNotifications";
import {
    Send,
    Smile,
    Bell,
    BellOff,
    X,
    Clock,
    ChevronLeft,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Trash2,
    Info,
    Copy,
    Check,
    Hash,
    Users,
} from "lucide-react";
import { inter } from "@/app/fonts";
import gsap from "gsap";

const EMOJI_GRID = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍",
    "🥰", "😘", "😋", "😛", "🤗", "🤔", "😴", "😢", "😭", "😤", "🤯", "👍",
    "👎", "👏", "🙏", "💪", "🔥", "✨", "💯", "❤️", "🎉", "👋", "✅", "⭐",
    "📝", "📎", "☕", "🚀",
];

const AVATAR_COLORS = [
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-sky-100 text-sky-700 border-sky-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-violet-100 text-violet-700 border-violet-200",
];

const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColorClass = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
};

const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const parseMsgDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? null : d;
};

const formatFullTimestamp = (dateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return "—";
    return d.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

const formatMessageMetaLine = (dateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return "Just now";
    const now = new Date();
    const timePart = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    if (startOfDay(d) === startOfDay(now)) return `Today · ${timePart}`;
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (startOfDay(d) === startOfDay(y)) return `Yesterday · ${timePart}`;
    const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    return `${datePart} · ${timePart}`;
};

const formatDayDividerOnly = (d) => {
    const now = new Date();
    if (startOfDay(d) === startOfDay(now)) return "Today";
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (startOfDay(d) === startOfDay(y)) return "Yesterday";
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getDayDividerLabel = (dateString, prevDateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return null;
    if (!prevDateString) return formatDayDividerOnly(d);
    const prev = parseMsgDate(prevDateString);
    if (!prev || startOfDay(d) !== startOfDay(prev)) return formatDayDividerOnly(d);
    return null;
};

const roomsFetcher = (url) => fetch(url).then((res) => res.json());

const renderWithMentions = (text, isOwn) => {
    if (!text) return null;
    const parts = String(text).split(/(@[\w.-]+)/g);
    return parts.map((part, i) =>
        part.startsWith("@") ? (
            <span
                key={i}
                className={`font-semibold underline decoration-transparent transition-colors ${
                    isOwn ? "text-indigo-200" : "text-indigo-600"
                }`}
            >
                {part}
            </span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

/* ─── Context Menu ───────────────────────────────────────────────── */
const MENU_ITEMS_OWN = [
    { id: "copy", icon: Copy, label: "Copy Text", danger: false },
    { id: "edit", icon: Pencil, label: "Edit Message", danger: false },
    { id: "details", icon: Info, label: "Message Info", danger: false },
    { id: "delete", icon: Trash2, label: "Delete", danger: true },
];
const MENU_ITEMS_OTHER = [
    { id: "copy", icon: Copy, label: "Copy Text", danger: false },
    { id: "details", icon: Info, label: "Message Info", danger: false },
];

function ContextMenu({ isOwn, position, onClose, onAction }) {
    const menuRef = useRef(null);
    const items = isOwn ? MENU_ITEMS_OWN : MENU_ITEMS_OTHER;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useLayoutEffect(() => {
        if (!menuRef.current) return;
        gsap.fromTo(
            menuRef.current,
            { opacity: 0, scale: 0.9, y: isOwn ? 4 : -4 },
            { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: "power2.out" }
        );
    }, [isOwn]);

    const close = useCallback(() => {
        if (!menuRef.current) { onClose(); return; }
        gsap.to(menuRef.current, {
            opacity: 0, scale: 0.94, y: isOwn ? 2 : -2,
            duration: 0.12, ease: "power2.in",
            onComplete: onClose,
        });
    }, [onClose, isOwn]);

    useEffect(() => {
        const handler = (e) => {
            if (!menuRef.current?.contains(e.target)) close();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [close]);

    if (!mounted || !position) return null;

    const menuContent = (
        <div
            ref={menuRef}
            className={`fixed z-50 min-w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl ring-1 ring-zinc-950/5 ${inter.className}`}
            style={{
                left: isOwn ? "auto" : `${position.left}px`,
                right: isOwn ? `${window.innerWidth - position.right}px` : "auto",
                bottom: `${window.innerHeight - position.top + 6}px`,
            }}
            role="menu"
        >
            {items.map(({ id, icon: Icon, label, danger }, idx) => (
                <button
                    key={id}
                    type="button"
                    role="menuitem"
                    onClick={() => { onAction(id); close(); }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        danger
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-zinc-700 hover:bg-zinc-100"
                    } ${idx > 0 && danger ? "mt-0.5 border-t border-zinc-100" : ""}`}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );

    return createPortal(menuContent, document.body);
}

/* ─── Single Message Item ────────────────────────────────────────── */
function MessageItem({ msg, isOwn }) {
    const bubbleRef = useRef(null);
    const actionRef = useRef(null);
    const buttonRef = useRef(null);
    const wrapRef = useRef(null);
    const hoverTl = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [buttonPosition, setButtonPosition] = useState(null);

    const displayName = isOwn ? "You" : msg.sender?.name || "Team member";
    const metaLine = formatMessageMetaLine(msg.createdAt);
    const fullTs = formatFullTimestamp(msg.createdAt);
    const initials = getInitials(msg.sender?.name || "Team member");
    const avatarColor = getAvatarColorClass(msg.sender?.name || "");

    useLayoutEffect(() => {
        if (!bubbleRef.current || !actionRef.current) return;
        hoverTl.current = gsap.timeline({ paused: true })
            .to(actionRef.current, {
                opacity: 1, scale: 1, x: 0,
                duration: 0.18, ease: "power2.out",
            }, 0);

        return () => hoverTl.current?.kill();
    }, [isOwn]);

    const onEnter = useCallback(() => hoverTl.current?.play(), []);
    const onLeave = useCallback(() => {
        if (menuOpen) return;
        hoverTl.current?.reverse();
    }, [menuOpen]);

    const handleMenuClose = useCallback(() => {
        setMenuOpen(false);
        setButtonPosition(null);
        if (wrapRef.current && !wrapRef.current.matches(":hover")) {
            hoverTl.current?.reverse();
        }
    }, []);

    useLayoutEffect(() => {
        if (!menuOpen || !buttonRef.current) {
            setButtonPosition(null);
            return;
        }
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
        });
    }, [menuOpen]);

    const handleAction = useCallback(async (id) => {
        if (id === "copy") {
            try {
                await navigator.clipboard.writeText(msg.text || "");
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            } catch { /* ignore */ }
            return;
        }
        if (msg.onAction) {
            msg.onAction(id, msg);
        }
    }, [msg]);

    return (
        <li
            ref={wrapRef}
            data-message-item
            className={`flex items-end gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {/* Avatar — other members */}
            {!isOwn && (
                <div
                    className={`mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold shadow-xs ${avatarColor}`}
                    title={displayName}
                >
                    {initials}
                </div>
            )}

            {/* Bubble Column */}
            <div
                className={`flex min-w-0 max-w-[80%] flex-col gap-1 sm:max-w-[70%] ${
                    isOwn ? "items-end" : "items-start"
                }`}
            >
                <div ref={bubbleRef} className="relative max-w-full">
                    <div
                        className={`rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed antialiased break-words [overflow-wrap:anywhere] shadow-xs ${
                            isOwn
                                ? "rounded-br-xs bg-zinc-900 text-white"
                                : "rounded-bl-xs border border-zinc-200/90 bg-white text-zinc-900"
                        }`}
                    >
                        {renderWithMentions(msg.text, isOwn)}
                    </div>
                </div>

                <time
                    dateTime={msg.createdAt || undefined}
                    title={fullTs}
                    className={`flex items-center gap-1.5 px-1 text-[10px] tabular-nums text-zinc-400 ${
                        isOwn ? "flex-row-reverse" : ""
                    }`}
                >
                    <Clock className="h-2.5 w-2.5 opacity-60" />
                    <span className="font-semibold text-zinc-500">
                        {displayName}
                    </span>
                    <span>{metaLine}</span>
                    {msg.isEdited && <span className="italic text-[9px]">(edited)</span>}
                </time>
            </div>

            {/* Inline Action Button */}
            <div
                ref={actionRef}
                className={`relative flex shrink-0 items-center self-end mb-1 opacity-0 transition-opacity ${
                    isOwn ? "order-first mr-1" : "order-last ml-1"
                }`}
            >
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 shadow-xs hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 transition-colors ${
                        menuOpen ? "border-zinc-900 bg-zinc-100 text-zinc-900" : ""
                    }`}
                    aria-label="Message actions"
                    aria-expanded={menuOpen}
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                        <MoreHorizontal className="h-3.5 w-3.5" />
                    )}
                </button>

                {menuOpen && buttonPosition && (
                    <ContextMenu
                        isOwn={isOwn}
                        position={buttonPosition}
                        onClose={handleMenuClose}
                        onAction={handleAction}
                    />
                )}
            </div>
        </li>
    );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function ChatRoomClient({ roomId: roomIdProp, embedded = false }) {
    const params = useParams();
    const roomId = roomIdProp ?? params?.id;
    const { user } = useUser();
    const { data: roomsPayload } = useSWR(
        roomId ? "/api/chat/rooms" : null,
        roomsFetcher,
        { revalidateOnFocus: true, dedupingInterval: 15_000 }
    );

    const resolvedRoomName = useMemo(() => {
        const r = roomsPayload?.rooms?.find(
            (room) => String(room.room_id) === String(roomId)
        );
        return r?.name ?? null;
    }, [roomsPayload, roomId]);

    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("messages");

    const {
        toast,
        dismissToast,
        notifyIncomingMessage,
        permission: notifyPermission,
        requestBrowserPermission,
        notificationsSupported,
    } = useChatMessageNotifications(roomId, user?.user_id);

    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState("");
    const [detailsMessage, setDetailsMessage] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const emojiPopoverRef = useRef(null);
    const messagesPanelRef = useRef(null);
    const participantsPanelRef = useRef(null);
    const messagesListRef = useRef(null);
    const participantsListRef = useRef(null);

    // Fetch initial chat history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat/history?room_id=${roomId}`);
                const data = await res.json();
                if (data.success) setMessages(data.history || []);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        if (roomId) fetchHistory();
    }, [roomId]);

    // Socket.io Realtime listeners
    useEffect(() => {
        if (!socket || !roomId) return;
        const room = String(roomId);

        const onReceive = (newMsg) => {
            if (!newMsg || String(newMsg.room_id) !== room) return;
            setMessages((prev) => {
                const id = newMsg.id;
                if (id != null && prev.some((m) => m.id === id)) return prev;
                queueMicrotask(() => notifyIncomingMessage(newMsg));
                return [...prev, newMsg];
            });
        };

        const onUpdateMsg = (updatedMsg) => {
            if (!updatedMsg || String(updatedMsg.room_id) !== room) return;
            setMessages((prev) =>
                prev.map((m) => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)
            );
        };

        const onDeleteMsg = (data) => {
            if (!data || String(data.room_id) !== room) return;
            setMessages((prev) => prev.filter((m) => m.id !== data.message_id));
        };

        const joinRoom = () => {
            if (socket.connected) {
                socket.emit("join_room", room);
            }
        };
        joinRoom();

        socket.on("connect", joinRoom);
        socket.on("receive_msg", onReceive);
        socket.on("update_msg", onUpdateMsg);
        socket.on("delete_msg", onDeleteMsg);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("receive_msg", onReceive);
            socket.off("update_msg", onUpdateMsg);
            socket.off("delete_msg", onDeleteMsg);
            if (socket.connected) {
                socket.emit("leave_room", room);
            }
        };
    }, [socket, roomId, notifyIncomingMessage]);

    // Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    const insertEmoji = useCallback((emoji) => {
        const el = inputRef.current;
        if (!el) { setInput((prev) => prev + emoji); return; }
        const start = el.selectionStart ?? input.length;
        const end = el.selectionEnd ?? start;
        const next = input.slice(0, start) + emoji + input.slice(end);
        setInput(next);
        requestAnimationFrame(() => {
            el.focus();
            const pos = start + emoji.length;
            el.setSelectionRange(pos, pos);
        });
    }, [input]);

    // Close emoji popover on click outside
    useEffect(() => {
        if (!emojiOpen) return;
        const onDown = (e) => {
            const t = e.target;
            if (emojiPopoverRef.current?.contains(t)) return;
            if (t.closest?.("[data-emoji-toggle]")) return;
            setEmojiOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [emojiOpen]);

    const participants = useMemo(() => {
        const map = new Map();
        if (user?.user_id != null) {
            map.set(user.user_id, {
                user_id: user.user_id,
                name: user.name || "You",
                isSelf: true
            });
        }
        for (const m of messages) {
            const uid = m.user_id;
            if (uid == null) continue;
            if (!map.has(uid)) {
                map.set(uid, {
                    user_id: uid,
                    name: m.sender?.name || `User ${uid}`,
                    isSelf: uid === user?.user_id,
                });
            }
        }
        return Array.from(map.values());
    }, [messages, user]);

    // Declare handleDeleteMessage BEFORE handleMessageAction to avoid access-before-declaration
    const handleDeleteMessage = useCallback(async (messageId) => {
        try {
            const response = await fetch(`/api/chat/messages/${messageId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== messageId));
                socket?.emit("delete_msg", { message_id: messageId, room_id: String(roomId) });
            }
        } catch (err) {
            console.error("Failed to delete message:", err);
            alert("Failed to delete message");
        }
    }, [socket, roomId]);

    const handleMessageAction = useCallback((action, msg) => {
        if (action === "edit") {
            setEditingMessage(msg);
            setEditText(msg.text || "");
        } else if (action === "delete") {
            if (window.confirm("Delete this message? This cannot be undone.")) {
                handleDeleteMessage(msg.id);
            }
        } else if (action === "details") {
            setDetailsMessage(msg);
        }
    }, [handleDeleteMessage]);

    const handleSaveEdit = useCallback(async () => {
        if (!editingMessage || !editText.trim()) return;
        setIsSavingEdit(true);
        try {
            const response = await fetch(`/api/chat/messages/${editingMessage.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: editText.trim() }),
            });
            if (response.ok) {
                const updated = await response.json();
                setMessages((prev) =>
                    prev.map((m) => m.id === editingMessage.id ? { ...m, text: editText.trim(), isEdited: true } : m)
                );
                socket?.emit("update_msg", {
                    id: editingMessage.id,
                    room_id: String(roomId),
                    text: editText.trim(),
                    isEdited: true,
                });
                setEditingMessage(null);
                setEditText("");
            }
        } catch (err) {
            console.error("Failed to save edit:", err);
            alert("Failed to save edit");
        } finally {
            setIsSavingEdit(false);
        }
    }, [editingMessage, editText, socket, roomId]);

    const handleSend = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !socket || !user || !socket.connected) return;
        socket.emit("send_msg", { room_id: String(roomId), user_id: user.user_id, text });
        setInput("");
        setEmojiOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const canSend = Boolean(input.trim() && socket?.connected && user);
    const roomTitle = resolvedRoomName ? `#${resolvedRoomName}` : "Team Channel";

    if (!roomId) {
        return (
            <div className={`flex min-h-[40vh] flex-1 items-center justify-center text-xs text-zinc-500 ${inter.className}`}>
                Missing conversation.
            </div>
        );
    }

    return (
        <div
            className={`flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden bg-white ${inter.className}`}
        >
            {/* Header */}
            <header className="shrink-0 border-b border-zinc-200/80 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Link
                            href="/chats"
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition-colors ${
                                embedded ? "md:hidden" : ""
                            }`}
                            aria-label="Back to channels"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Link>

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800">
                            <Hash className="h-4 w-4 stroke-[2.2]" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-sm sm:text-base font-bold text-zinc-900">
                                    {roomTitle}
                                </h1>

                                {/* Socket connection badge */}
                                {socket?.connected ? (
                                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live
                                    </span>
                                ) : (
                                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/60">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Connecting
                                    </span>
                                )}
                            </div>

                            <p className="truncate text-[11px] text-zinc-400">
                                {participants.length} {participants.length === 1 ? "member" : "members"} in room
                            </p>
                        </div>
                    </div>

                    {/* Right: Tab switch & Notification Bell */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50/70 p-0.5 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setActiveTab("messages")}
                                className={`rounded-md px-2.5 py-1 transition-all ${
                                    activeTab === "messages"
                                        ? "bg-white text-zinc-900 shadow-xs"
                                        : "text-zinc-500 hover:text-zinc-900"
                                }`}
                            >
                                Messages
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("participants")}
                                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
                                    activeTab === "participants"
                                        ? "bg-white text-zinc-900 shadow-xs"
                                        : "text-zinc-500 hover:text-zinc-900"
                                }`}
                            >
                                <Users className="h-3 w-3" />
                                <span>{participants.length}</span>
                            </button>
                        </div>

                        {notificationsSupported && (
                            <button
                                type="button"
                                onClick={() => requestBrowserPermission()}
                                className={`rounded-lg border p-1.5 transition-colors ${
                                    notifyPermission === "granted"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                                }`}
                                title={
                                    notifyPermission === "granted"
                                        ? "Notifications active"
                                        : "Enable desktop notifications"
                                }
                            >
                                {notifyPermission === "granted" ? (
                                    <Bell className="h-4 w-4" />
                                ) : (
                                    <BellOff className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {toast && (
                    <div
                        role="status"
                        className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs shadow-xs"
                    >
                        <p className="truncate text-zinc-700">
                            <strong className="text-zinc-900">{toast.name}:</strong> {toast.preview}
                        </p>
                        <button
                            type="button"
                            onClick={dismissToast}
                            className="rounded-md p-0.5 text-zinc-400 hover:text-zinc-700"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </header>

            {/* Messages Content */}
            {activeTab === "messages" ? (
                <div ref={messagesPanelRef} className="flex min-h-0 flex-1 flex-col">
                    <div
                        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 [scrollbar-width:thin]"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        {messages.length === 0 ? (
                            <div className="flex h-full min-h-52 flex-col items-center justify-center text-center p-6">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-400 shadow-xs">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-800">
                                    No messages in this channel yet
                                </h3>
                                <p className="mt-1 text-xs text-zinc-400 max-w-xs">
                                    Start the conversation! Teammates in this room will see your messages in real time.
                                </p>
                            </div>
                        ) : (
                            <ul ref={messagesListRef} className="flex min-w-0 flex-col gap-3">
                                {messages.map((msg, index) => {
                                    const isOwn = msg.user_id === user?.user_id;
                                    const key = msg.id ?? `${msg.room_id}-${msg.createdAt}-${index}`;
                                    const prevMsg = messages[index - 1];
                                    const dayLabel = getDayDividerLabel(msg.createdAt, prevMsg?.createdAt);
                                    const msgWithAction = { ...msg, onAction: handleMessageAction };

                                    return (
                                        <Fragment key={key}>
                                            {dayLabel && (
                                                <li className="my-2 flex list-none items-center gap-3">
                                                    <div className="h-px flex-1 bg-zinc-200/80" />
                                                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 shadow-xs">
                                                        {dayLabel}
                                                    </span>
                                                    <div className="h-px flex-1 bg-zinc-200/80" />
                                                </li>
                                            )}
                                            <MessageItem
                                                msg={msgWithAction}
                                                isOwn={isOwn}
                                            />
                                        </Fragment>
                                    );
                                })}
                            </ul>
                        )}
                        <div ref={scrollRef} className="h-2 shrink-0" />
                    </div>

                    {/* Input Bar */}
                    <div className="shrink-0 border-t border-zinc-200/80 bg-white p-3 sm:px-4">
                        <form onSubmit={handleSend} className="relative flex items-center gap-2">
                            {/* Emoji Picker Popover */}
                            {emojiOpen && (
                                <div
                                    ref={emojiPopoverRef}
                                    className="absolute bottom-full left-0 mb-2 z-50 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl ring-1 ring-zinc-950/5"
                                    role="dialog"
                                    aria-label="Emoji picker"
                                >
                                    <div className="grid grid-cols-8 gap-1 p-1 max-h-48 overflow-y-auto [scrollbar-width:thin]">
                                        {EMOJI_GRID.map((em) => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => { insertEmoji(em); setEmojiOpen(false); }}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-base hover:bg-zinc-100 transition-colors"
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative flex flex-1 items-center rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-xs focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900 transition-all">
                                <button
                                    type="button"
                                    data-emoji-toggle
                                    onClick={() => setEmojiOpen((o) => !o)}
                                    className="p-2 text-zinc-400 hover:text-zinc-700 transition-colors"
                                    aria-label="Insert emoji"
                                >
                                    <Smile className="h-4 w-4" />
                                </button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Message ${roomTitle}… (Enter to send)`}
                                    className="min-w-0 flex-1 bg-transparent py-2.5 pr-2 text-xs sm:text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!canSend}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Participants Panel */
                <div
                    ref={participantsPanelRef}
                    className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin]"
                >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Channel Members ({participants.length})
                        </span>
                    </div>

                    <ul ref={participantsListRef} className="mt-3 space-y-2">
                        {participants.map((p) => {
                            const initials = getInitials(p.name);
                            const avatarColor = getAvatarColorClass(p.name);

                            return (
                                <li
                                    key={p.user_id}
                                    className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-xs"
                                >
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold ${avatarColor}`}
                                    >
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-xs font-semibold text-zinc-900">
                                                {p.name}
                                            </p>
                                            {p.isSelf && (
                                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-400">Team Collaborator</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Edit Message Modal */}
            {editingMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
                        onClick={() => setEditingMessage(null)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-zinc-950/10">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <h3 className="text-sm font-semibold text-zinc-900">Edit Message</h3>
                            <button
                                onClick={() => setEditingMessage(null)}
                                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mt-3">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 resize-none"
                                rows={4}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-100">
                            <button
                                type="button"
                                onClick={() => setEditingMessage(null)}
                                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={!editText.trim() || isSavingEdit}
                                className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                            >
                                {isSavingEdit ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Details Modal */}
            {detailsMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
                        onClick={() => setDetailsMessage(null)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-zinc-950/10">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                            <h3 className="text-sm font-semibold text-zinc-900">Message Details</h3>
                            <button
                                onClick={() => setDetailsMessage(null)}
                                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mt-3 space-y-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sender</span>
                                <p className="text-xs font-semibold text-zinc-900 mt-0.5">
                                    {detailsMessage.sender?.name || `User #${detailsMessage.user_id}`}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Timestamp</span>
                                <p className="text-xs text-zinc-600 mt-0.5">
                                    {formatFullTimestamp(detailsMessage.createdAt)}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Content</span>
                                <p className="text-xs text-zinc-800 mt-0.5 rounded-xl border border-zinc-100 bg-zinc-50 p-2.5">
                                    {detailsMessage.text}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                            <button
                                onClick={() => setDetailsMessage(null)}
                                className="rounded-xl border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
