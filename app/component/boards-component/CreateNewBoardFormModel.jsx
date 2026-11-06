"use client";
import React, { useState } from 'react';
import { X, Palette, Check, Layers, Loader2 } from 'lucide-react';
import { inter } from '@/app/fonts';
import { toast } from 'sonner';

const PRESET_COLORS = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Sky', value: '#0284c7' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Slate', value: '#475569' },
    { name: 'Zinc', value: '#18181b' },
];

const CreateNewBoardFormModel = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bg_color: '#4f46e5',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError('');
    };

    const handleSelectColor = (color) => {
        setFormData((prev) => ({ ...prev, bg_color: color }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Board title is required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    bg_color: formData.bg_color || '#4f46e5',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create board');
            }

            toast.success('Board created successfully!');
            setFormData({
                name: '',
                description: '',
                bg_color: '#4f46e5',
            });

            onSuccess?.(data.board);
            onClose?.();
        } catch (err) {
            setError(err.message || 'An error occurred while creating board');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                className={`relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-950/10 ${inter.className}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                            style={{ backgroundColor: formData.bg_color }}
                        >
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                                Create New Board
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Add a Kanban workspace to plan sprints, workflows, and tasks.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 rounded-lg bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Board Name */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                            Board Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Q3 Growth Sprint, Product Roadmap"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Summary of this board's objectives, stakeholders, or workflow stages..."
                            rows={3}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Color Theme */}
                    <div>
                        <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-700">
                            <span className="flex items-center gap-1.5">
                                <Palette className="h-3.5 w-3.5 text-zinc-400" />
                                Accent Color
                            </span>
                            <span className="font-mono text-[11px] font-normal text-zinc-500">
                                {formData.bg_color}
                            </span>
                        </label>

                        {/* Presets */}
                        <div className="flex flex-wrap items-center gap-2">
                            {PRESET_COLORS.map((preset) => {
                                const isSelected = formData.bg_color.toLowerCase() === preset.value.toLowerCase();
                                return (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => handleSelectColor(preset.value)}
                                        className={`group relative flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                                            isSelected ? 'ring-2 ring-zinc-900 ring-offset-2 scale-105' : 'hover:scale-105 opacity-85 hover:opacity-100'
                                        }`}
                                        style={{ backgroundColor: preset.value }}
                                        title={preset.name}
                                    >
                                        {isSelected && (
                                            <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                                        )}
                                    </button>
                                );
                            })}

                            {/* Custom Color Input */}
                            <label className="relative flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 cursor-pointer">
                                <span className="text-[11px]">Custom</span>
                                <input
                                    type="color"
                                    value={formData.bg_color}
                                    onChange={(e) => handleSelectColor(e.target.value)}
                                    className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-98 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                'Create Board'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNewBoardFormModel;
