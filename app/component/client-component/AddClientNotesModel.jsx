"use client";

import React, { useState } from 'react';
import { FiX, FiMessageSquare } from 'react-icons/fi';
import { SlNote } from "react-icons/sl";
import { toast } from 'sonner';


const AddClientNotesModal = ({ clientId, isOpen, onClose, onSuccess }) => {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${clientId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: note })
            });

            if (res.ok) {
                setNote("");
                onSuccess(); // Refresh the timeline
                onClose();   // Close modal
                toast.success("Note added successfully!");
            }
        } catch (error) {
            console.error("Failed to add note:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Glass Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl shadow-slate-900/20 overflow-hidden transform transition-all border border-slate-100">

                {/* Header */}
                <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#57CAD9]/10 rounded-2xl flex items-center justify-center text-[#57CAD9]">
                            <SlNote size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Add Client Note</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[12px]  text-black/80  tracking-widest ml-1">
                            Enter your client note below:
                        </label>
                        <textarea
                            required
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Detail the latest progress or feedback..."
                            rows={4}
                            className="w-full mt-3  bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#57CAD9]/20 focus:border-[#57CAD9] focus:bg-white transition-all resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-lg border border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || !note.trim()}
                            className="flex-1 px-6 py-3.5 rounded-lg bg-slate-950 text-white text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                        >
                            {loading ? "Syncing..." : "Add Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientNotesModal;