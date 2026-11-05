"use client";

import React, { useState } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";

export default function AddClientNotesModal({ clientId, isOpen, onClose, onSuccess }) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${clientId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: note.trim() }),
            });

            if (res.ok) {
                setNote("");
                if (onSuccess) onSuccess();
                onClose();
                toast.success("Activity note added successfully.");
            } else {
                toast.error("Failed to add note.");
            }
        } catch {
            toast.error("Failed to add note.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs ${inter.className}`}
        >
            <div
                className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl transition-all"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                            <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                                Add Activity Note
                            </h2>
                            <p className="text-[11px] text-zinc-500">
                                Record a meeting recap, client update, or feedback.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                            Note Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Discussed new contract scope, client requested a proposal revision by Friday..."
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400 resize-none transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !note.trim()}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Save Note</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
