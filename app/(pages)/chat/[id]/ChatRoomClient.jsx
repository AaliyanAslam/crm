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
    Paperclip,
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
} from "lucide-react";
import { inter, urbanist } from "@/app/fonts";
import gsap from "gsap";

const TEAL = "#0d9488";
const TEAL_SOFT = "#ccfbf1";

const EMOJI_GRID = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍",
    "🥰", "😘", "😋", "😛", "🤗", "🤔", "😴", "😢", "😭", "😤", "🤯", "👍",
    "👎", "👏", "🙏", "💪", "🔥", "✨", "💯", "❤️", "🎉", "👋", "✅", "⭐",
    "📝", "📎", "☕", "🚀",
];

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
    return d.toLocaleString("en-GB", {
        weekday: "long", day: "numeric", month: "long",
        year: "numeric", hour: "2-digit", minute: "2-digit",
        second: "2-digit", hour12: true,
    });
};

const formatMessageMetaLine = (dateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return "Just now";
    const now = new Date();
    const timePart = d.toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    if (startOfDay(d) === startOfDay(now)) return `Today · ${timePart}`;
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (startOfDay(d) === startOfDay(y)) return `Yesterday · ${timePart}`;
    const datePart = d.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
    return `${datePart} · ${timePart}`;
};

const formatDayDividerOnly = (d) => {
    const now = new Date();
    if (startOfDay(d) === startOfDay(now)) return "Today";
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (startOfDay(d) === startOfDay(y)) return "Yesterday";
    return d.toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
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

const renderWithMentions = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(@[\w.-]+)/g);
    return parts.map((part, i) =>
        part.startsWith("@") ? (
            <span key={i} className="font-semibold" style={{ color: TEAL }}>{part}</span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

/* ─── Context Menu ───────────────────────────────────────────────── */
const MENU_ITEMS_OWN = [
    { id: "edit", icon: Pencil, label: "Edit message", danger: false },
    { id: "copy", icon: Copy, label: "Copy text", danger: false },
    { id: "details", icon: Info, label: "View details", danger: false },
    { id: "delete", icon: Trash2, label: "Delete", danger: true },
];
const MENU_ITEMS_OTHER = [
    { id: "copy", icon: Copy, label: "Copy text", danger: false },
    { id: "details", icon: Info, label: "View details", danger: false },
];

function ContextMenu({ isOwn, position, onClose, onAction }) {
    const menuRef = useRef(null);
    const items = isOwn ? MENU_ITEMS_OWN : MENU_ITEMS_OTHER;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useLayoutEffect(() => {
        if (!menuRef.current) return;
        gsap.fromTo(
            menuRef.current,
            { opacity: 0, scale: 0.88, y: isOwn ? 6 : -6, filter: "blur(6px)" },
            { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.22, ease: "back.out(1.6)", clearProps: "filter" }
        );
    }, [isOwn]);

    const close = useCallback(() => {
        if (!menuRef.current) { onClose(); return; }
        gsap.to(menuRef.current, {
            opacity: 0, scale: 0.9, y: isOwn ? 4 : -4,
            duration: 0.15, ease: "power2.in",
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
            className={`${urbanist.className} fixed z-50 min-w-42 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/98 py-1.5 shadow-2xl shadow-slate-300/30 ring-1 ring-slate-100/80 backdrop-blur-md ${isOwn ? "origin-bottom-right" : "origin-bottom-left"
                }`}
            style={{
                left: isOwn ? "auto" : `${position.left}px`,
                right: isOwn ? `${window.innerWidth - position.right}px` : "auto",
                bottom: `${window.innerHeight - position.top + 8}px`,
            }}
            role="menu"
        >
            {items.map(({ id, icon: Icon, label, danger }, idx) => (
                <button
                    key={id}
                    type="button"
                    role="menuitem"
                    onClick={() => { onAction(id); close(); }}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${danger
                        ? "text-red-500 hover:bg-red-50/80"
                        : "text-slate-700 hover:bg-slate-50/90"
                        } ${idx > 0 && danger ? "mt-0.5 border-t border-slate-100" : ""}`}
                >
                    <Icon size={15} strokeWidth={2} className={danger ? "text-red-400" : "text-slate-400"} />
                    {label}
                </button>
            ))}
        </div>
    );

    return createPortal(menuContent, document.body);
}

/* ─── Single Message Item ────────────────────────────────────────── */
function MessageItem({ msg, isOwn, user }) {
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

    /* Build reusable hover timeline once */
    useLayoutEffect(() => {
        if (!bubbleRef.current || !actionRef.current) return;

        const slideX = isOwn ? 5 : -5;

        hoverTl.current = gsap.timeline({ paused: true })
            .to(bubbleRef.current, {
                x: slideX, duration: 0.28, ease: "power2.out",
            }, 0)
            .to(actionRef.current, {
                opacity: 1, scale: 1, x: 0,
                duration: 0.22, ease: "back.out(1.4)",
            }, 0.04);

        return () => hoverTl.current?.kill();
    }, [isOwn]);

    const onEnter = useCallback(() => hoverTl.current?.play(), []);
    const onLeave = useCallback(() => {
        if (menuOpen) return;
        hoverTl.current?.reverse();
    }, [menuOpen]);

    /* When menu closes, reverse animation if not hovering */
    const handleMenuClose = useCallback(() => {
        setMenuOpen(false);
        setButtonPosition(null);
        // Check if mouse is still on the message item
        if (wrapRef.current && !wrapRef.current.matches(":hover")) {
            hoverTl.current?.reverse();
        }
    }, []);

    /* Calculate button position when menu opens */
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
            } catch { }
            return;
        }
        // Pass action to parent component through callback
        if (msg.onAction) {
            msg.onAction(id, msg);
        }
    }, [msg]);

    /* Action button: opposite side of bubble */
    const ActionBtn = () => (
        <div
            ref={actionRef}
            className={`relative flex shrink-0 items-center self-end mb-1 ${isOwn ? "order-first mr-1" : "order-last ml-1"
                }`}
            style={!menuOpen ? { opacity: 50, scale: 0.8, x: isOwn ? 6 : -6 } : undefined}
        >
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-400 shadow-md shadow-slate-200/40 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 ${menuOpen ? "border-teal-200 bg-teal-50 text-teal-600" : ""
                    }`}
                aria-label="Message actions"
                aria-expanded={menuOpen}
            >
                {copied
                    ? <Check size={14} strokeWidth={2.5} className="text-teal-500" />
                    : <MoreHorizontal size={15} strokeWidth={2} />
                }
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
    );

    return (
        <li
            ref={wrapRef}
            data-message-item
            className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {/* Avatar — others only */}
            {!isOwn && (
                <div className="mb-1 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md shadow-slate-200/50">
                    <img
                        src={`${msg.sender.image || "https://w7.pngwing.com/pngs/490/157/png-transparent-male-avatar-boy-face-man-user-flat-classy-users-icon.png"}`}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </div>
            )}

            {/* Bubble column */}
            <div
                className={`flex min-w-0 max-w-[78%] flex-col gap-1 sm:max-w-[72%] ${isOwn ? "items-end" : "items-start"
                    }`}
            >


                <div ref={bubbleRef} className="relative">
                    <div
                        className={`rounded-[18px] px-4 py-2.5 text-[14px] leading-relaxed text-slate-800 antialiased wrap-anywhere sm:rounded-[20px] sm:text-[14.5px] ${isOwn
                            ? "rounded-br-[6px] bg-linear-to-br from-emerald-50/80 to-green-100/90 ring-1 ring-violet-200/25 "
                            : "rounded-bl-[6px] bg-linear-to-br from-gray-100/90 to-gray-200/90 border border-slate-200/40 bg-white shadow-md shadow-slate-200/30 ring-1 ring-white/80"
                            }`}
                    >
                        {renderWithMentions(msg.text)}

                    </div>
                </div>

                <time
                    dateTime={msg.createdAt || undefined}
                    title={fullTs}
                    className={`flex items-center gap-1 px-1 text-[10.5px] tabular-nums leading-none text-slate-400 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                    <Clock className="shrink-0 opacity-60" size={11} strokeWidth={2} aria-hidden />
                    <span className={`px-1 text-[11.5px] font-semibold tracking-tight text-slate-500 ${isOwn ? "text-right" : "text-left"}`}>
                        {displayName}
                    </span>
                    <span>{metaLine}</span>
                    {msg.isEdited && <span className="text-slate-400 italic text-[10px]">(edited)</span>}
                </time>
            </div>

            {/* Floating action button */}
            <ActionBtn />
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
        { revalidateOnFocus: true, dedupingInterval: 20_000 }
    );
    const resolvedRoomName = useMemo(() => {
        const list = roomsPayload?.rooms;
        if (!list || !roomId) return null;
        const hit = list.find((r) => String(r.room_id) === String(roomId));
        return hit?.name ?? null;
    }, [roomsPayload, roomId]);

    const socket = useSocket();
    const {
        toast, dismissToast, notifyIncomingMessage,
        permission: notifyPermission, requestBrowserPermission, notificationsSupported,
    } = useChatMessageNotifications(roomId, user?.user_id);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("messages");
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
    const prevMessageCountRef = useRef(0);
    const prevParticipantsKeyRef = useRef("");
    const participantsTabPrimedRef = useRef(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat/history?room_id=${roomId}`);
                const data = await res.json();
                if (data.success) setMessages(data.history || []);
            } catch (err) { console.error("Failed to load history", err); }
        };
        if (roomId) fetchHistory();
    }, [roomId]);

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
        const joinRoom = () => socket.emit("join_room", room);
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
            socket.emit("leave_room", room);
        };
    }, [socket, roomId, notifyIncomingMessage]);

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

    useEffect(() => {
        if (activeTab !== "messages") return;
        const onKey = (e) => {
            if (e.repeat) return;
            const semicolon = e.code === "Semicolon" || e.key === ";" || e.key === "؛";
            if (!semicolon) return;
            const osMod = e.metaKey || e.ctrlKey ||
                (typeof e.getModifierState === "function" &&
                    (e.getModifierState("OS") || e.getModifierState("Super")));
            if (!osMod) return;
            e.preventDefault();
            setEmojiOpen((open) => !open);
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [activeTab]);

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
            map.set(user.user_id, { user_id: user.user_id, name: user.name || "You", isSelf: true });
        }
        for (const m of messages) {
            const uid = m.user_id;
            if (uid == null) continue;
            if (!map.has(uid)) {
                map.set(uid, {
                    user_id: uid,
                    name: m.sender?.name || `Member ${uid}`,
                    isSelf: uid === user?.user_id,
                    image: m.sender?.image
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [messages, user]);

    const participantsKey = useMemo(
        () => participants.map((p) => p.user_id).join(","),
        [participants]
    );

    useLayoutEffect(() => {
        const el = activeTab === "messages" ? messagesPanelRef.current : participantsPanelRef.current;
        if (!el) return;
        gsap.fromTo(el,
            { opacity: 0, y: 14, filter: "blur(12px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out", clearProps: "filter" }
        );
    }, [activeTab]);

    useLayoutEffect(() => {
        if (activeTab !== "messages") return;
        const list = messagesListRef.current;
        if (!list) return;
        const items = list.querySelectorAll(":scope > li[data-message-item]");
        const n = items.length;
        if (n === 0) { prevMessageCountRef.current = 0; return; }
        const prev = prevMessageCountRef.current;
        if (n > prev) {
            if (prev === 0) {
                gsap.fromTo(items,
                    { opacity: 0, y: 22, filter: "blur(8px)" },
                    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.42, stagger: 0.055, ease: "power2.out", clearProps: "filter" }
                );
            } else {
                gsap.fromTo(items[n - 1],
                    { opacity: 0, y: 16, scale: 0.97, filter: "blur(10px)" },
                    { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.45, ease: "back.out(1.35)", clearProps: "filter" }
                );
            }
        }
        prevMessageCountRef.current = n;
    }, [messages, activeTab]);

    useLayoutEffect(() => {
        if (activeTab !== "participants") {
            participantsTabPrimedRef.current = false; return;
        }
        const list = participantsListRef.current;
        if (!list) return;
        const items = list.querySelectorAll(":scope > li");
        if (items.length === 0) return;
        const keyChanged = prevParticipantsKeyRef.current !== participantsKey;
        const shouldAnimate = !participantsTabPrimedRef.current || keyChanged;
        prevParticipantsKeyRef.current = participantsKey;
        participantsTabPrimedRef.current = true;
        if (!shouldAnimate) return;
        gsap.fromTo(items,
            { opacity: 0, x: -16, filter: "blur(6px)" },
            { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.4, stagger: 0.075, ease: "power2.out", clearProps: "filter" }
        );
    }, [activeTab, participantsKey]);

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
    }, []);

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
                const updatedMsg = await response.json();
                setMessages((prev) =>
                    prev.map((m) => m.id === editingMessage.id ? { ...m, text: editText.trim() } : m)
                );
                socket?.emit("update_msg", { ...editingMessage, text: editText.trim(), room_id: String(roomId) });
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

    const canSend = Boolean(input.trim() && socket?.connected && user);
    const roomTitle = resolvedRoomName || "Group Chat";

    if (!roomId) {
        return (
            <div className={`flex min-h-[40vh] flex-1 items-center justify-center text-sm text-slate-500 ${inter.className}`}>
                Missing conversation.
            </div>
        );
    }

    return (
        <div
            className={
                embedded
                    ? `relative flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-x-clip overflow-y-hidden bg-linear-to-b from-slate-100 via-slate-50 to-teal-50/30 px-2 pb-1 pt-0 sm:px-3 sm:pb-2 sm:pt-2 md:px-4 ${inter.className}`
                    : `relative flex min-h-screen justify-center overflow-x-clip overflow-y-auto bg-linear-to-b from-slate-100 via-slate-50 to-teal-50/30 px-3 py-4 sm:px-6 sm:py-8 ${inter.className}`
            }
        >
            <div
                className={
                    embedded
                        ? "pointer-events-none absolute inset-0 bg-[radial-linear(ellipse_75%_45%_at_50%_-8%,rgba(13,148,136,0.09),transparent)]"
                        : "pointer-events-none fixed inset-0 bg-[radial-linear(ellipse_75%_45%_at_50%_-8%,rgba(13,148,136,0.09),transparent)]"
                }
                aria-hidden
            />

            <div
                className={
                    embedded
                        ? "relative mx-auto flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/70 bg-white/95 shadow-sm ring-1 ring-slate-200/40 backdrop-blur-sm sm:rounded-xl md:max-w-md md:rounded-2xl md:shadow-[0_20px_40px_-14px_rgba(15,23,42,0.1)] lg:max-w-4xl"
                        : "relative flex h-[calc(100dvh-2rem)] w-full max-w-100 flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/50 backdrop-blur-sm sm:h-[min(680px,calc(100dvh-4rem))] sm:max-w-105"
                }
            >
                {/* ── Header ── */}
                <header className="shrink-0 border-b border-slate-100/90 bg-linear-to-b from-white via-white to-slate-50/40 px-3 pb-2.5 pt-3 sm:px-4 sm:pb-3 sm:pt-3.5">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                        <Link
                            href="/chats"
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 ${embedded ? "md:hidden" : ""}`}
                            aria-label="Back to messages"
                        >
                            <ChevronLeft size={20} strokeWidth={2} />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Team chat
                            </p>
                            <h1 className="mt-0.5 truncate text-base font-semibold capitalize tracking-tight text-slate-900 sm:text-lg">
                                {roomTitle}
                            </h1>
                            {user && (
                                <p className="mt-1 text-[12.5px] leading-snug text-slate-500">
                                    Signed in as{" "}
                                    <span className="font-semibold capitalize" style={{ color: TEAL }}>
                                        {user.name?.trim() || "You"}
                                    </span>
                                </p>
                            )}
                        </div>
                        {notificationsSupported && (
                            <button
                                type="button"
                                onClick={() => requestBrowserPermission()}
                                className={`mt-0.5 shrink-0 rounded-xl p-2 shadow-sm transition-all ${notifyPermission === "granted"
                                    ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                                    : "bg-slate-100/90 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700"
                                    }`}
                                title={
                                    notifyPermission === "granted"
                                        ? "Background notifications on"
                                        : notifyPermission === "denied"
                                            ? "Notifications blocked — enable in browser settings"
                                            : "Enable notifications when this tab is in the background"
                                }
                                aria-label={notifyPermission === "granted" ? "Notifications enabled" : "Enable notifications"}
                            >
                                {notifyPermission === "granted"
                                    ? <Bell size={19} strokeWidth={2} />
                                    : <BellOff size={19} strokeWidth={2} />
                                }
                            </button>
                        )}
                    </div>

                    {toast && (
                        <div
                            role="status"
                            className="mt-3 flex gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-teal-800">{toast.name}</p>
                                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-slate-600">{toast.preview}</p>
                            </div>
                            <button
                                type="button"
                                onClick={dismissToast}
                                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Dismiss notification"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    )}

                    {/* Tab bar */}
                    <div className="mt-3 flex rounded-full bg-slate-200/60 p-1 shadow-inner sm:mt-3.5" role="tablist">
                        {["messages", "participants"].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 rounded-full py-2 text-[13px] font-semibold capitalize transition-all duration-200 ${activeTab === tab
                                    ? "text-teal-900 shadow-sm ring-1 ring-slate-200/60"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                                style={activeTab === tab ? { backgroundColor: TEAL_SOFT } : undefined}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                {/* ── Messages Panel ── */}
                {activeTab === "messages" ? (
                    <div ref={messagesPanelRef} className="flex min-h-0 flex-1 flex-col">
                        <div
                            className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-linear-to-b from-slate-50/90 to-white px-3 pb-3 pt-1 sm:px-4 md:px-5 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
                            style={{ WebkitOverflowScrolling: "touch" }}
                        >
                            {messages.length === 0 ? (
                                <div className="flex h-full min-h-52 flex-col items-center justify-center px-6 text-center">
                                    <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100">
                                        <MessageSquare className="text-teal-600" size={24} strokeWidth={1.75} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">No messages yet</p>
                                    <p className="mt-1.5 max-w-55 text-xs leading-relaxed text-slate-400">
                                        Say hello — your team will see messages here in real time.
                                    </p>
                                </div>
                            ) : (
                                <ul ref={messagesListRef} className="flex min-w-0 flex-col gap-3.5 py-2 sm:gap-4">
                                    {messages.map((msg, index) => {
                                        const isOwn = msg.user_id === user?.user_id;
                                        const key = msg.id ?? `${msg.room_id}-${msg.createdAt}-${msg.text?.slice(0, 20)}`;
                                        const prevMsg = messages[index - 1];
                                        const dayLabel = getDayDividerLabel(msg.createdAt, prevMsg?.createdAt);
                                        const msgWithAction = { ...msg, onAction: handleMessageAction };

                                        return (
                                            <Fragment key={key}>
                                                {dayLabel && (
                                                    <li className="flex list-none justify-center py-1" aria-hidden>
                                                        <span className="rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-slate-500 shadow-sm shadow-slate-200/30">
                                                            {dayLabel}
                                                        </span>
                                                    </li>
                                                )}
                                                <MessageItem
                                                    msg={msgWithAction}
                                                    isOwn={isOwn}
                                                    user={user}
                                                />
                                            </Fragment>
                                        );
                                    })}
                                </ul>
                            )}
                            <div ref={scrollRef} className="h-2 shrink-0" />
                        </div>

                        {/* ── Input bar ── */}
                        <div className="shrink-0 border-t border-slate-100/90 bg-linear-to-t from-slate-50/95 to-white px-3 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] pt-2.5 sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:pt-3">
                            <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-2.5">
                                <div className="relative min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white py-1 pl-3.5 pr-1.5 shadow-inner shadow-slate-100/80 ring-1 ring-slate-100/50 transition-all focus-within:border-teal-300/60 focus-within:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus-within:ring-teal-100 sm:pl-4">
                                    {emojiOpen && (
                                        <div
                                            ref={emojiPopoverRef}
                                            className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl shadow-slate-300/30 ring-1 ring-slate-100/80 backdrop-blur-md"
                                            role="dialog"
                                            aria-label="Emoji picker"
                                        >
                                            <div className="max-h-44 overflow-y-auto [scrollbar-width:thin]">
                                                <div className="grid grid-cols-8 gap-0.5 p-1">
                                                    {EMOJI_GRID.map((em) => (
                                                        <button
                                                            key={em}
                                                            type="button"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg leading-none transition-colors hover:bg-slate-100 active:scale-95"
                                                            onClick={() => { insertEmoji(em); setEmojiOpen(false); }}
                                                        >
                                                            {em}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="border-t border-slate-100 bg-slate-50/50 px-2.5 py-2 text-[10px] leading-snug text-slate-400">
                                                <span className="font-semibold text-slate-500">⊞ + ;</span> or{" "}
                                                <span className="font-semibold text-slate-500">Ctrl + ;</span> · smile button
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Message the team…"
                                            className="min-w-0 flex-1 bg-transparent py-2.5 pr-1 text-[14.5px] text-slate-800 outline-none placeholder:text-slate-400 sm:py-3"
                                            autoComplete="off"
                                        />
                                        <div className="flex shrink-0 items-center gap-0.5 pr-0.5">
                                            <button
                                                type="button"
                                                data-emoji-toggle
                                                className={`rounded-xl p-2 transition-colors ${emojiOpen
                                                    ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                    }`}
                                                aria-label="Emoji picker"
                                                aria-expanded={emojiOpen}
                                                onClick={() => setEmojiOpen((o) => !o)}
                                            >
                                                <Smile size={19} strokeWidth={1.75} />
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                                aria-label="Attach file"
                                            >
                                                <Paperclip size={19} strokeWidth={1.75} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!canSend}
                                    className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/35 transition-all hover:from-teal-600 hover:to-emerald-700 hover:shadow-teal-500/45 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none sm:h-11 sm:w-11"
                                    aria-label="Send message"
                                >
                                    <Send size={18} className="-ml-0.5 translate-x-px" />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* ── Participants Panel ── */
                    <div
                        ref={participantsPanelRef}
                        className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-linear-to-b from-slate-50/90 to-white px-3 pb-8 pt-3 sm:px-4 md:px-5"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        <p className="mb-3.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            In this room · {participants.length}
                        </p>
                        <ul ref={participantsListRef} className="flex flex-col gap-2">
                            {participants.map((p) => (
                                <li
                                    key={p.user_id}
                                    className="flex items-center gap-3 rounded-2xl border-b border-slate-200/70 bg-white/95 px-3.5 py-3 shadow-sm shadow-slate-200/30 ring-1 ring-white/60"
                                >
                                    <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-100 shadow-sm">
                                        <img
                                            src={`${p.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQHstFutlfl8tgZAtY8nDWucSWEvFM5AETQ&s"}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold capitalize text-slate-800" onClick={() => {
                                            console.log(participants)

                                        }}>
                                            {p.name}
                                            {p.isSelf && (
                                                <span className="ml-2 text-xs font-medium" style={{ color: TEAL }}>
                                                    You
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {participants.length === 0 && (
                            <p className="py-12 text-center text-sm leading-relaxed text-slate-400">
                                No one here yet. Send a message to appear in this list.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Message Modal */}
            {editingMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white shadow-xl ring-1 ring-slate-100/80">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">Edit Message</h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-teal-300/60 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:ring-teal-100"
                                rows={10}
                                autoFocus
                            />
                            <p className="mt-2 text-xs text-slate-400">
                                {editText.length} characters
                            </p>
                        </div>
                        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingMessage(null);
                                    setEditText("");
                                }}
                                disabled={isSavingEdit}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={!editText.trim() || isSavingEdit}
                                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                                {isSavingEdit ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Details Modal */}
            {detailsMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white shadow-xl ring-1 ring-slate-100/80">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">Message Details</h2>
                        </div>
                        <div className="space-y-4 p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</p>
                                <p className="mt-1.5 text-sm text-slate-800">
                                    {detailsMessage.sender?.name || `User ${detailsMessage.user_id}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sent</p>
                                <p className="mt-1.5 text-sm text-slate-800">
                                    {formatFullTimestamp(detailsMessage.createdAt)}
                                </p>
                            </div>
                            {detailsMessage.updatedAt && detailsMessage.updatedAt !== detailsMessage.createdAt && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Edited</p>
                                    <p className="mt-1.5 text-sm text-slate-800">
                                        {formatFullTimestamp(detailsMessage.updatedAt)}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Message</p>
                                <p className="mt-1.5 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
                                    {detailsMessage.text}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setDetailsMessage(null)}
                                className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
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