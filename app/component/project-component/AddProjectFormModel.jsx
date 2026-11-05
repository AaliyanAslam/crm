"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { X, Loader2, Briefcase, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";

const fetcher = (url) => fetch(url).then((res) => res.json());

const initialForm = {
    client_id: "",
    project_name: "",
    description: "",
    status: "In Progress",
    budget: "",
    start_date: "",
    deadline: "",
    priority: "Medium",
    logo_url: "",
};

export default function AddProjectFormModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: clientsData = [] } = useSWR(isOpen ? "/api/client" : null, fetcher, {
        revalidateOnFocus: false,
        fallbackData: [],
    });

    const clients = Array.isArray(clientsData) ? clientsData : clientsData.data || [];

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.project_name || !formData.client_id) {
            toast.error("Please provide a project name and assign a client.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    client_id: parseInt(formData.client_id, 10),
                    budget: parseFloat(formData.budget) || 0,
                    start_date: formData.start_date || null,
                    deadline: formData.deadline || null,
                }),
            });

            if (res.ok) {
                toast.success("Project created successfully!");
                setFormData(initialForm);
                await mutate("/api/project");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message || "Failed to create project.");
            }
        } catch (err) {
            toast.error(err.message || "Failed to create project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs ${inter.className}`}
        >
            <div
                className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl transition-all"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                            <Briefcase className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                                Create New Project
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Assign a client, set budget allocations, and define milestones.
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
                <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto px-5 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        
                        {/* Assign Client */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Assign Client <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                            >
                                <option value="">Select a client from directory...</option>
                                {clients.map((c) => (
                                    <option key={c.client_id} value={c.client_id}>
                                        {c.full_name} {c.company_name ? `(${c.company_name})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project Name */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Project Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                name="project_name"
                                value={formData.project_name}
                                onChange={handleChange}
                                placeholder="e.g. Global Logistics Dashboard Redesign"
                                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Scope & Description
                            </label>
                            <textarea
                                rows={2.5}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Key deliverables, technical requirements, or sprint goals..."
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400 resize-none"
                            />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Budget ($ USD)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">
                                    $
                                </span>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="25000"
                                    className="w-full rounded-lg border border-zinc-200 pl-7 pr-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                                />
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Priority Level
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Initial Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                            >
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                            </select>
                        </div>

                        {/* Logo / Thumbnail URL */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Thumbnail / Logo URL
                            </label>
                            <input
                                type="url"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                                Delivery Deadline
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Create Project</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
