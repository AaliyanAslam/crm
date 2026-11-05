"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
    ArrowLeft,
    Mail,
    Phone,
    Globe,
    MapPin,
    Plus,
    Building2,
    Calendar,
    Clock,
    Trash2,
    UserCheck,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";
import AddClientNotesModal from "@/app/component/client-component/AddClientNotesModel";

const fetcher = (url) => fetch(url).then((res) => res.json());

const getClientAvatar = (client) =>
    client?.profile_image_url ||
    (client?.gender === "Male"
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
        : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png");

export default function ClientProfilePage() {
    const { id } = useParams();
    const router = useRouter();

    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState(null);

    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/client/${id}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            fallbackData: null,
        }
    );

    const handleDeleteNote = async (noteId) => {
        const ok = confirm("Are you sure you want to delete this activity note?");
        if (!ok) return;

        try {
            setDeletingNoteId(noteId);
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Note deleted successfully.");
                await mutate();
            } else {
                toast.error("Failed to delete note.");
            }
        } catch {
            toast.error("Failed to delete note.");
        } finally {
            setDeletingNoteId(null);
        }
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen bg-zinc-50/70 p-6 flex items-center justify-center ${inter.className}`}>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-700" />
                    <span>Loading client profile...</span>
                </div>
            </div>
        );
    }

    if (error || !data || !data.client) {
        return (
            <div className={`min-h-screen bg-zinc-50/70 p-6 flex flex-col items-center justify-center text-center ${inter.className}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-3">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Client Not Found</h2>
                <p className="mt-1 max-w-sm text-xs text-zinc-500">
                    The requested client account does not exist or may have been deleted.
                </p>
                <Link
                    href="/clients"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Directory</span>
                </Link>
            </div>
        );
    }

    const { client, notes = [] } = data;
    const avatar = getClientAvatar(client);

    return (
        <div
            suppressHydrationWarning
            className={`min-h-screen bg-zinc-50/70 pb-16 text-zinc-900 ${inter.className}`}
        >
            <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-5">
                
                {/* Breadcrumb & Navigation */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                            <Link href="/clients" className="hover:text-zinc-900 transition-colors">
                                Clients
                            </Link>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-800 font-semibold">{client.full_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                                {client.full_name}
                            </h1>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    client.status === "Active"
                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                        : client.status === "Pending"
                                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                        : "bg-zinc-100 text-zinc-600"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        client.status === "Active"
                                            ? "bg-emerald-500"
                                            : client.status === "Pending"
                                            ? "bg-amber-500"
                                            : "bg-zinc-400"
                                    }`}
                                />
                                {client.status || "Pending"}
                            </span>
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                                {client.lead_stage || "New"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/clients"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Directory</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsAddNoteOpen(true)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Note</span>
                        </button>
                    </div>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Left Column (Metadata) */}
                    <div className="lg:col-span-4 space-y-4">
                        
                        {/* Profile Card */}
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={avatar}
                                    alt=""
                                    className="h-14 w-14 rounded-full object-cover border border-zinc-200"
                                />
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-zinc-900 truncate">
                                        {client.full_name}
                                    </h2>
                                    <p className="text-xs text-zinc-500 truncate">
                                        {client.company_name || "Independent"}
                                    </p>
                                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-zinc-400">
                                        <Calendar className="h-3 w-3" />
                                        Joined {new Date(client.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs">
                                <div className="flex items-start gap-2.5">
                                    <Mail className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Email</p>
                                        <a href={`mailto:${client.email}`} className="text-zinc-800 hover:underline truncate block">
                                            {client.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <Phone className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Phone</p>
                                        <p className="text-zinc-800 truncate">
                                            {client.phone_number || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <Globe className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Website</p>
                                        {client.website_url ? (
                                            <a
                                                href={client.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline truncate block"
                                            >
                                                {client.website_url.replace(/(^\w+:|^)\/\//, "")}
                                            </a>
                                        ) : (
                                            <p className="text-zinc-400">Not provided</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Location</p>
                                        <p className="text-zinc-800">
                                            {[client.city, client.state, client.country].filter(Boolean).join(", ") || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pipeline Context Card */}
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Pipeline Context
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100">
                                    <p className="text-[10px] text-zinc-400 font-medium">Lead Source</p>
                                    <p className="mt-0.5 font-semibold text-zinc-800 truncate">
                                        {client.lead_source || "Direct"}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100">
                                    <p className="text-[10px] text-zinc-400 font-medium">Pipeline Stage</p>
                                    <p className="mt-0.5 font-semibold text-zinc-800 truncate">
                                        {client.lead_stage || "New"}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Activity Timeline & Notes) */}
                    <div className="lg:col-span-8">
                        <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
                            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 bg-white">
                                <div>
                                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Activity Timeline & Notes
                                    </h3>
                                    <p className="text-[11px] text-zinc-500">
                                        Historical record of touchpoints, client updates, and notes
                                    </p>
                                </div>
                                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                                    {notes.length} {notes.length === 1 ? "entry" : "entries"}
                                </span>
                            </div>

                            <div className="p-5">
                                {notes.length === 0 ? (
                                    <div className="py-12 text-center text-zinc-400">
                                        <Clock className="mx-auto h-8 w-8 text-zinc-300 stroke-[1.5]" />
                                        <p className="mt-2 text-xs font-medium text-zinc-600">No activity notes recorded yet</p>
                                        <p className="mt-0.5 text-[11px] text-zinc-400">
                                            Click &quot;Add Note&quot; to log client communications or meeting notes.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddNoteOpen(true)}
                                            className="mt-3 cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Add first note</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-zinc-200 ml-3 space-y-5">
                                        {notes.map((n) => (
                                            <div key={n.note_id} className="relative pl-6 group">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-zinc-900 shadow-xs" />
                                                
                                                <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400 mb-1">
                                                    <span className="font-medium text-zinc-500">
                                                        {new Date(n.created_at).toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "numeric",
                                                            minute: "numeric",
                                                        })}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        title="Delete note"
                                                        disabled={deletingNoteId === n.note_id}
                                                        onClick={() => handleDeleteNote(n.note_id)}
                                                        className="cursor-pointer opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                    >
                                                        {deletingNoteId === n.note_id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-3 text-xs text-zinc-800 leading-relaxed">
                                                    {n.note}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Add Note Modal */}
                <AddClientNotesModal
                    clientId={id}
                    isOpen={isAddNoteOpen}
                    onClose={() => setIsAddNoteOpen(false)}
                    onSuccess={() => mutate()}
                />

            </div>
        </div>
    );
}
