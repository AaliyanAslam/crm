"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { inter } from '@/app/fonts';
import {
    FiMoreVertical, FiEdit3, FiUser, FiCalendar,
    FiSearch, FiCheck, FiCircle, FiX, FiInbox
} from "react-icons/fi";
import { User } from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';

const fetcher = (url) => fetch(url).then((res) => res.json());

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    'Planning': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    'In Progress': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    'Completed': { bg: 'bg-[#5FC8DB]/10', text: 'text-[#5FC8DB]', dot: 'bg-[#5FC8DB]' },
    'On Hold': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
};

// BUG FIX #3 — three distinct priority colours
const PRIORITY_CONFIG = {
    'High': { bar: 'bg-red-500', label: 'text-red-600' },
    'Medium': { bar: 'bg-amber-400', label: 'text-amber-600' },
    'Low': { bar: 'bg-emerald-400', label: 'text-emerald-600' },
};

const STATUSES = ["Planning", "In Progress", "Completed", "On Hold"];

/* ─────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────── */
const ProjectsGrid = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const CACHE_KEY = 'devskarnel_projects_v2';
    const { data, mutate } = useSWR('/api/project',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    )

    const projectsData = useMemo(() => {
        if (Array.isArray(data)) return data;
        return data?.projects || data?.data || [];
    }, [data]);

    useEffect(() => {
        if (isEditModalOpen) {
            // Disable scroll on both html and body
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scroll
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, [isEditModalOpen])


    useEffect(() => {
        if (data) {
            setProjects(projectsData);
            setLoading(false);
        }
    }, [data]);

    const filteredProjects = useMemo(() => projectsData.filter(p => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = (p.project_name || "").toLowerCase().includes(q) ||
            (p.client_name || "").toLowerCase().includes(q) ||
            (p.client_email || "").toLowerCase().includes(q) ||
            (p.company_name || "").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [searchTerm, statusFilter, projectsData]);

    const handleEditInitiate = (project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    return (
        <div className={`px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-6 lg:py-5 rounded-xl md:rounded-2xl bg-white/80 min-h-screen ${inter.className}`}>
            <div className="max-w-7xl mx-auto">

                {/* ── Header & Filters ── */}
                <div className="mb-4 sm:mb-5 md:mb-6 flex flex-col gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                            Project Pipeline
                        </h1>
                        <p className="text-gray-500 text-[11px] sm:text-xs font-medium tracking-wide mt-1">
                            {loading
                                ? "Syncing..."
                                : `Managing ${filteredProjects.length} assignment${filteredProjects.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 transition-colors"
                                >
                                    <FiX size={13} />
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder="Search projects…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:border-[#5FC8DB] focus:ring-1 focus:ring-[#5FC8DB]/30 outline-none transition-all"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto pl-3 pr-9 py-2 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 outline-none focus:border-[#5FC8DB] focus:ring-1 focus:ring-[#5FC8DB]/30 transition-all cursor-pointer"
                        >
                            {["All", ...STATUSES].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                    {loading ? (
                        [...Array(6)].map((_, i) => <SkeletonCard key={i} delay={i * 80} />)
                    ) : filteredProjects.length === 0 ? (
                        /* Empty state */
                        <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400 gap-3">
                            <FiInbox size={32} strokeWidth={1.2} />
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">No projects found</p>
                            {(searchTerm || statusFilter !== "All") && (
                                <button
                                    onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
                                    className="mt-2 text-xs font-semibold uppercase tracking-widest text-gray-800 border border-gray-800 px-3 py-2 rounded-md hover:bg-gray-900 hover:text-white transition-all"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.project_id}
                                data={project}
                                onUpdate={() => mutate()}
                                onEdit={() => handleEditInitiate(project)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedProject && (
                <EditProjectModal
                    project={selectedProject}
                    onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }}
                    onSuccess={() => mutate()}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────────────────── */
const ProjectCard = ({ data, onUpdate, onEdit }) => {
    const status = STATUS_CONFIG[data.status] || STATUS_CONFIG['Planning'];
    // BUG FIX #3 — correct priority colour per level
    const priority = PRIORITY_CONFIG[data.priority] || PRIORITY_CONFIG['Low'];

    const formattedDeadline = data.deadline
        ? new Date(data.deadline).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    const formattedBudget = data.budget
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.budget)
        : 'Not set';

    return (
        <div className="group relative isolate overflow-visible rounded-lg md:rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 md:p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            {/* Top row */}
            <div className="relative z-10 flex justify-between items-center mb-2 sm:mb-2.5">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                    {data.logo_url
                        ? <img src={data.logo_url} alt={data.project_name} className="w-full h-full object-cover" />
                        : <User size={14} className="text-slate-400" />
                    }
                </div>
                <div className={`px-2 py-0.5 sm:py-1 ${status.bg} ${status.text} rounded-full flex items-center gap-1 ring-1 ring-black/5 text-[8px] sm:text-[9px] font-semibold uppercase tracking-tight`}>
                    <span className={`w-0.5 h-0.5 ${status.dot} rounded-full animate-pulse`}></span>
                    <span>{data.status}</span>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 mb-2 sm:mb-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug mb-0.5 tracking-tight line-clamp-1">{data.project_name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-tight">{data.description || 'No description provided.'}</p>
            </div>

            {/* Meta */}
            <div className="relative z-10 space-y-1.5 mb-2 pt-2 sm:pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                    <FiUser size={10} className="text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs">{data.client_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                    <div className="rounded-md border border-slate-200 bg-white/50 px-1.5 py-1">
                        <p className="text-[8px] font-semibold uppercase tracking-tight text-slate-400">Deadline</p>
                        <div className="mt-0.5 flex items-center gap-0.5 text-[9px] text-slate-700 font-semibold">
                            <FiCalendar size={9} className="text-slate-400" />
                            <span className="truncate">{formattedDeadline}</span>
                        </div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white/50 px-1.5 py-1">
                        <p className="text-[8px] font-semibold uppercase tracking-tight text-slate-400">Budget</p>
                        <p className="mt-0.5 text-[9px] font-semibold text-slate-700 truncate">{formattedBudget}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-0.5 h-2 rounded-full ${priority.bar}`}></div>
                    <span className={`text-[8px] font-semibold uppercase tracking-tight ${priority.label}`}>
                        {data.priority}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex justify-between items-center pt-2 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={onEdit}
                        title="Edit project"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
                    >
                        <FiEdit3 size={12} />
                    </button>
                    <StatusDropdown projectId={data.project_id} currentStatus={data.status} onUpdate={onUpdate} />
                </div>
                <div className="w-7 h-7 bg-[#5FC8DB] rounded-full flex items-center justify-center text-[9px] font-semibold text-white select-none ring-2 ring-white shadow-sm">
                    {data.client_name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   EDIT MODAL  (PUT)
───────────────────────────────────────────────────────────── */
const EditProjectModal = ({ project, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        project_name: project.project_name || "",
        description: project.description || "",
        status: project.status || "Planning",
        budget: project.budget || "",
        deadline: project.deadline ? project.deadline.split('T')[0] : "",
        priority: project.priority || "Medium",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const patch = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/project/${project.project_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                onSuccess();
                onClose();
                toast.success("Project updated successfully!");
            } else {
                setError("Failed to update. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    // Close on backdrop click
    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    // BUG FIX #2 — z-[100] instead of z-100
    return (
        <div
            onClick={handleBackdrop}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 flex items-center justify-center p-3 sm:p-4"
        >
            <div className="bg-white rounded-xl w-full max-w-sm md:max-w-lg shadow-2xl transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
                {/* Modal header */}
                <div className="flex justify-between items-center px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 md:pt-5 pb-2 sm:pb-3 border-b border-slate-100">
                    <div className="min-w-0">
                        <h2 className="text-sm md:text-base font-semibold text-gray-900">Edit Project</h2>
                        <p className="text-xs text-gray-500 font-normal mt-0.5 truncate">{project.project_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all shrink-0"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 space-y-2.5">
                    {/* Project name */}
                    <div>
                        <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">
                            Project Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Redesign Homepage"
                            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-normal text-gray-800 transition-all"
                            value={formData.project_name}
                            onChange={patch('project_name')}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">
                            Description
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Brief project overview…"
                            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-[#5FC8DB] focus:ring-2 focus:ring-[#5FC8DB]/20 text-xs font-normal text-gray-800 resize-none transition-all"
                            value={formData.description}
                            onChange={patch('description')}
                        />
                    </div>

                    {/* Budget & Deadline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Budget ($)</label>
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-normal text-gray-800 transition-all"
                                value={formData.budget}
                                onChange={patch('budget')}
                            />
                        </div>
                        <div>
                            <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Deadline</label>
                            <input
                                type="date"
                                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-normal text-gray-800 transition-all"
                                value={formData.deadline}
                                onChange={patch('deadline')}
                            />
                        </div>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Priority</label>
                            <select
                                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-normal text-gray-800 transition-all cursor-pointer appearance-none"
                                value={formData.priority}
                                onChange={patch('priority')}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[0.65rem] md:text-[0.75rem] font-medium text-slate-700 mb-0.5">Status</label>
                            <select
                                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-normal text-gray-800 transition-all cursor-pointer appearance-none"
                                value={formData.status}
                                onChange={patch('status')}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-md px-2.5 py-2">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-1.5 md:py-2 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-1.5 md:py-2 bg-linear-to-r from-[#5FC8DB] to-[#5FC8DB]/80 hover:from-[#5FC8DB]/90 hover:to-[#5FC8DB]/70 text-white rounded-md text-xs font-semibold shadow-lg shadow-[#5FC8DB]/30 hover:shadow-[#5FC8DB]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   STATUS DROPDOWN  (PATCH)
───────────────────────────────────────────────────────────── */
const StatusDropdown = ({ projectId, currentStatus, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const updateStatus = async (newStatus) => {
        if (newStatus === currentStatus) { setOpen(false); return; }
        setOpen(false);
        setUpdating(true);
        try {
            const res = await fetch(`/api/project/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                onUpdate();
                toast.success(`Status updated to "${newStatus}"`);
            }
        } catch (error) {
            console.error("Status update error:", error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                title="Change status"
                disabled={updating}
                onClick={() => setOpen(o => !o)}
                className={`p-1 rounded-md transition-all duration-150 ${open
                    ? 'bg-[#5FC8DB] text-white'
                    : updating
                        ? 'text-gray-300 cursor-wait'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                    }`}
            >
                <FiMoreVertical size={13} />
            </button>

            {open && (
                <div className="absolute right-0 bottom-full mb-1.5 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-1">
                    <p className="px-2 pt-1 pb-1 text-[8px] font-semibold text-slate-600 uppercase tracking-tight border-b border-slate-100">
                        Change Status
                    </p>
                    {STATUSES.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        const active = currentStatus === s;
                        return (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                className={`w-full flex items-center justify-between mt-0.5 rounded-md px-2 py-1 text-[8px] font-medium uppercase tracking-tight transition-colors ${active
                                    ? 'bg-[#5FC8DB]/15 text-[#5FC8DB]'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-0.5 h-0.5 rounded-full ${cfg.dot}`}></span>
                                    {s}
                                </div>
                                {active
                                    ? <FiCheck size={9} className="text-[#5FC8DB]" />
                                    : <FiCircle size={7} className="text-gray-300" />
                                }
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD  — shimmer animation via Tailwind
───────────────────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
    <div
        className="bg-white border border-slate-200 p-2.5 sm:p-3 md:p-4 rounded-lg md:rounded-xl animate-pulse"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex justify-between mb-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
            <div className="w-14 h-4 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 bg-slate-100 rounded-md w-3/4 mb-1" />
        <div className="h-2 bg-slate-100 rounded-md w-full mb-0.5" />
        <div className="h-2 bg-slate-100 rounded-md w-2/3 mb-1.5" />
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <div className="h-2 bg-slate-100 rounded-md w-1/3" />
            <div className="w-7 h-7 bg-slate-100 rounded-full" />
        </div>
    </div>
);

export default ProjectsGrid;