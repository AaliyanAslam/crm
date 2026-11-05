"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
    Search,
    X,
    LayoutGrid,
    List,
    Pencil,
    Trash2,
    Calendar,
    DollarSign,
    Building2,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Clock,
    PauseCircle,
} from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";
import { useSettings } from "@/app/hooks/useSettings";

const fetcher = (url) => fetch(url).then((res) => res.json());

const STATUS_MAP = {
    "In Progress": {
        label: "In Progress",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
    },
    Planning: {
        label: "Planning",
        badge: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300/40",
        dot: "bg-zinc-400",
        icon: Clock,
    },
    Completed: {
        label: "Completed",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
        dot: "bg-blue-500",
        icon: CheckCircle2,
    },
    "On Hold": {
        label: "On Hold",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
        dot: "bg-amber-500",
        icon: PauseCircle,
    },
};

const PRIORITY_MAP = {
    High: {
        badge: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
        bar: "bg-red-500",
    },
    Medium: {
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
        bar: "bg-amber-500",
    },
    Low: {
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
        bar: "bg-emerald-500",
    },
};

export default function ProjectsData() {
    const { formatCurrency } = useSettings();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

    const [editingProject, setEditingProject] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const { data, mutate, isLoading } = useSWR("/api/project", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: { projects: [] },
    });

    const projectsList = useMemo(() => {
        if (Array.isArray(data)) return data;
        return data?.projects || data?.data || [];
    }, [data]);

    // Filtering
    const filteredProjects = useMemo(() => {
        return projectsList.filter((p) => {
            if (statusFilter !== "All" && p.status !== statusFilter) return false;
            if (priorityFilter !== "All" && p.priority !== priorityFilter) return false;

            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchName = p.project_name?.toLowerCase().includes(q);
                const matchDesc = p.description?.toLowerCase().includes(q);
                const clientName = p.Client?.full_name?.toLowerCase() || "";
                const clientComp = p.Client?.company_name?.toLowerCase() || "";
                return matchName || matchDesc || clientName.includes(q) || clientComp.includes(q);
            }
            return true;
        });
    }, [projectsList, searchTerm, statusFilter, priorityFilter]);

    // Quick Status Update
    const handleQuickStatusChange = async (projectId, newStatus) => {
        try {
            const res = await fetch(`/api/project/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Project moved to ${newStatus}`);
                await mutate();
            } else {
                toast.error("Failed to update status.");
            }
        } catch {
            toast.error("Failed to update status.");
        }
    };

    // Delete Project
    const handleDeleteProject = async (project) => {
        const ok = confirm(`Delete project "${project.project_name}"?`);
        if (!ok) return;

        try {
            const res = await fetch(`/api/project/${project.project_id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Project deleted successfully.");
                await mutate();
            } else {
                toast.error("Failed to delete project.");
            }
        } catch {
            toast.error("Failed to delete project.");
        }
    };

    // Edit Project form submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/project/${editingProject.project_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editingProject,
                    budget: parseFloat(editingProject.budget) || 0,
                }),
            });

            if (res.ok) {
                toast.success("Project updated successfully!");
                await mutate();
                setEditingProject(null);
            } else {
                toast.error("Failed to update project.");
            }
        } catch {
            toast.error("Failed to update project.");
        } finally {
            setIsUpdating(false);
        }
    };

    const hasFilters = Boolean(searchTerm.trim() || statusFilter !== "All" || priorityFilter !== "All");

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setPriorityFilter("All");
    };

    return (
        <div className={`space-y-4 ${inter.className}`}>
            {/* Filter and Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 bg-white shadow-xs">
                
                {/* Search & Selectors */}
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search projects or clients..."
                            className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-7 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Planning">Planning</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
                        >
                            <option value="All">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                            >
                                <X className="h-3 w-3" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* View Switcher & Counter */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
                    <span>
                        <strong className="text-zinc-900 font-semibold">{filteredProjects.length}</strong> projects
                    </span>

                    <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
                        <button
                            type="button"
                            title="Grid View"
                            onClick={() => setViewMode("grid")}
                            className={`cursor-pointer rounded-md p-1 transition-colors ${
                                viewMode === "grid"
                                    ? "bg-white text-zinc-900 shadow-xs"
                                    : "text-zinc-400 hover:text-zinc-700"
                            }`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            title="Table View"
                            onClick={() => setViewMode("table")}
                            className={`cursor-pointer rounded-md p-1 transition-colors ${
                                viewMode === "table"
                                    ? "bg-white text-zinc-900 shadow-xs"
                                    : "text-zinc-400 hover:text-zinc-700"
                            }`}
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Content View */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-56 animate-pulse rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs"
                        />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-zinc-200/80 bg-white p-12 text-center shadow-xs">
                    <AlertCircle className="mx-auto h-8 w-8 text-zinc-300 stroke-[1.5]" />
                    <h3 className="mt-2 text-sm font-semibold text-zinc-800">No projects match criteria</h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                        Try tweaking your search term or select another status filter.
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredProjects.map((p) => {
                        const statusObj = STATUS_MAP[p.status] || STATUS_MAP.Planning;
                        const priorityObj = PRIORITY_MAP[p.priority] || PRIORITY_MAP.Medium;
                        const clientName = p.Client?.full_name || "Unassigned Client";
                        const clientComp = p.Client?.company_name;

                        return (
                            <div
                                key={p.project_id}
                                className="group flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 hover:shadow-sm transition-all"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {p.logo_url ? (
                                                <img
                                                    src={p.logo_url}
                                                    alt=""
                                                    className="h-8 w-8 rounded-lg object-cover border border-zinc-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700">
                                                    {p.project_name?.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                                                    {p.project_name}
                                                </h3>
                                                <p className="text-[11px] text-zinc-500 truncate">
                                                    {clientName} {clientComp ? `· ${clientComp}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${priorityObj.badge}`}>
                                            {p.priority}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="mt-2.5 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                                        {p.description || "No project description provided."}
                                    </p>

                                    {/* Key Metadata Chips */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2.5 border-t border-zinc-100 text-xs">
                                        <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5 border border-zinc-100/80">
                                            <span className="text-[10px] text-zinc-400 font-medium block">
                                                Budget
                                            </span>
                                            <span className="font-semibold text-zinc-800 tabular-nums">
                                                {p.budget ? formatCurrency(p.budget) : "—"}
                                            </span>
                                        </div>

                                        <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5 border border-zinc-100/80">
                                            <span className="text-[10px] text-zinc-400 font-medium block">
                                                Deadline
                                            </span>
                                            <span className="font-semibold text-zinc-800 truncate block text-[11px]">
                                                {p.deadline ? new Date(p.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer & Status Selector */}
                                <div className="mt-3.5 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                                    <div className="relative">
                                        <select
                                            value={p.status}
                                            onChange={(e) => handleQuickStatusChange(p.project_id, e.target.value)}
                                            className="appearance-none rounded-full bg-zinc-100/80 pl-2.5 pr-6 py-0.5 text-[10px] font-semibold text-zinc-700 outline-none hover:bg-zinc-200/80 cursor-pointer"
                                        >
                                            <option value="Planning">Planning</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="On Hold">On Hold</option>
                                        </select>
                                        <span className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            title="Edit Project"
                                            onClick={() => setEditingProject(p)}
                                            className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Delete Project"
                                            onClick={() => handleDeleteProject(p)}
                                            className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 sm:px-5">Project</th>
                                    <th className="px-4 py-3 sm:px-5">Client / Company</th>
                                    <th className="px-4 py-3 sm:px-5">Status</th>
                                    <th className="px-4 py-3 sm:px-5">Priority</th>
                                    <th className="px-4 py-3 sm:px-5">Budget</th>
                                    <th className="px-4 py-3 sm:px-5">Deadline</th>
                                    <th className="px-4 py-3 sm:px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                {filteredProjects.map((p) => {
                                    const statusObj = STATUS_MAP[p.status] || STATUS_MAP.Planning;
                                    const priorityObj = PRIORITY_MAP[p.priority] || PRIORITY_MAP.Medium;
                                    const clientName = p.Client?.full_name || "—";
                                    const clientComp = p.Client?.company_name;

                                    return (
                                        <tr key={p.project_id} className="hover:bg-zinc-50/70 transition-colors">
                                            <td className="px-4 py-2.5 sm:px-5 font-semibold text-zinc-900">
                                                {p.project_name}
                                            </td>
                                            <td className="px-4 py-2.5 sm:px-5">
                                                <span className="font-medium text-zinc-800">{clientName}</span>
                                                {clientComp && <span className="text-zinc-400 block text-[11px]">{clientComp}</span>}
                                            </td>
                                            <td className="px-4 py-2.5 sm:px-5">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusObj.badge}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 sm:px-5">
                                                <span className={`inline-flex rounded-sm px-1.5 py-0.2 text-[10px] font-semibold ${priorityObj.badge}`}>
                                                    {p.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 sm:px-5 tabular-nums font-medium text-zinc-800">
                                                {p.budget ? formatCurrency(p.budget) : "—"}
                                            </td>
                                            <td className="px-4 py-2.5 sm:px-5 text-zinc-500">
                                                {p.deadline ? new Date(p.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                            </td>
                                            <td className="px-4 py-2.5 sm:px-5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingProject(p)}
                                                        className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteProject(p)}
                                                        className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Project Dialog */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs">
                    <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900">Edit Project Details</h3>
                                <p className="text-xs text-zinc-500">Update timeline, budget, and scope for this project.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingProject(null)}
                                className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="max-h-[75vh] overflow-y-auto px-5 py-4 space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Project Name</label>
                                <input
                                    required
                                    value={editingProject.project_name || ""}
                                    onChange={(e) => setEditingProject({ ...editingProject, project_name: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Description</label>
                                <textarea
                                    rows={2.5}
                                    value={editingProject.description || ""}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Budget ($)</label>
                                    <input
                                        type="number"
                                        value={editingProject.budget || ""}
                                        onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Status</label>
                                    <select
                                        value={editingProject.status || "Planning"}
                                        onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Priority</label>
                                    <select
                                        value={editingProject.priority || "Medium"}
                                        onChange={(e) => setEditingProject({ ...editingProject, priority: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={editingProject.deadline ? editingProject.deadline.split("T")[0] : ""}
                                        onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
