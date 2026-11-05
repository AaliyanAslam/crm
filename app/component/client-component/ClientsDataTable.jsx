"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
    Search,
    Filter,
    X,
    ExternalLink,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Globe,
    Building2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";

const fetcher = (url) => fetch(url).then((res) => res.json());

const getClientAvatar = (client) =>
    client?.profile_image_url ||
    (client?.gender === "Male"
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
        : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png");

export default function ClientsDataTable({ searchQuery = "", onSearchChange }) {
    const router = useRouter();

    const { data, mutate, isLoading } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    const clients = useMemo(() => {
        if (Array.isArray(data)) return data;
        return data?.data || [];
    }, [data]);

    // Local filters & pagination
    const [localSearch, setLocalSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [stageFilter, setStageFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Edit modal state
    const [editingClient, setEditingClient] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const query = searchQuery !== undefined && onSearchChange ? searchQuery : localSearch;
    const handleSearchInput = (val) => {
        if (onSearchChange) onSearchChange(val);
        else setLocalSearch(val);
        setCurrentPage(1);
    };

    // Filter clients
    const filteredClients = useMemo(() => {
        return clients.filter((c) => {
            if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
            if (stageFilter !== "ALL" && c.lead_stage !== stageFilter) return false;

            if (query.trim()) {
                const q = query.toLowerCase();
                const matchName = c.full_name?.toLowerCase().includes(q);
                const matchEmail = c.email?.toLowerCase().includes(q);
                const matchCompany = c.company_name?.toLowerCase().includes(q);
                const matchCity = c.city?.toLowerCase().includes(q);
                const matchCountry = c.country?.toLowerCase().includes(q);
                return matchName || matchEmail || matchCompany || matchCity || matchCountry;
            }
            return true;
        });
    }, [clients, query, statusFilter, stageFilter]);

    // Pagination calculations
    const totalItems = filteredClients.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredClients.slice(start, start + pageSize);
    }, [filteredClients, currentPage, pageSize]);

    // Delete client
    const handleDelete = async (client) => {
        const ok = confirm(`Are you sure you want to delete ${client.full_name}?`);
        if (!ok) return;

        try {
            const res = await fetch(`/api/client/${client.client_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                toast.success("Client record deleted successfully.");
                await mutate();
            } else {
                toast.error("Failed to delete client.");
            }
        } catch {
            toast.error("Failed to delete client.");
        }
    };

    // Edit handlers
    const handleUpdateChange = (e) => {
        setEditingClient({ ...editingClient, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/client/${editingClient.client_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingClient),
            });
            if (res.ok) {
                toast.success("Client updated successfully!");
                await mutate();
                setEditingClient(null);
            } else {
                toast.error("Failed to update client.");
            }
        } catch {
            toast.error("Failed to update client.");
        } finally {
            setIsUpdating(false);
        }
    };

    const clearFilters = () => {
        handleSearchInput("");
        setStatusFilter("ALL");
        setStageFilter("ALL");
        setCurrentPage(1);
    };

    const hasActiveFilters = Boolean(query.trim() || statusFilter !== "ALL" || stageFilter !== "ALL");

    return (
        <div className={`space-y-3 ${inter.className}`}>
            {/* Filter and Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-4 border-b border-zinc-100 bg-white">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Live Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Search by name, email, company, city..."
                            className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-7 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all placeholder:text-zinc-400"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => handleSearchInput("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Filter by Status */}
                    <div className="flex items-center gap-1.5">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Closed">Closed</option>
                        </select>

                        {/* Filter by Stage */}
                        <select
                            value={stageFilter}
                            onChange={(e) => {
                                setStageFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
                        >
                            <option value="ALL">All Stages</option>
                            <option value="New">Stage: New</option>
                            <option value="Contacted">Stage: Contacted</option>
                            <option value="Qualified">Stage: Qualified</option>
                            <option value="Converted">Stage: Converted</option>
                            <option value="Lost">Stage: Lost</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                            >
                                <X className="h-3 w-3" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 text-xs text-zinc-500">
                    <span>
                        <strong className="text-zinc-900 font-semibold">{totalItems}</strong> clients found
                    </span>
                </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 sm:px-5">Client</th>
                            <th className="px-4 py-3 sm:px-5">Company</th>
                            <th className="px-4 py-3 sm:px-5 hidden md:table-cell">Contact</th>
                            <th className="px-4 py-3 sm:px-5 hidden lg:table-cell">Location</th>
                            <th className="px-4 py-3 sm:px-5">Lead Stage</th>
                            <th className="px-4 py-3 sm:px-5">Status</th>
                            <th className="px-4 py-3 sm:px-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {isLoading ? (
                            [...Array(pageSize)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-zinc-100" />
                                            <div className="space-y-1">
                                                <div className="h-3.5 w-24 bg-zinc-100 rounded" />
                                                <div className="h-3 w-32 bg-zinc-100 rounded" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="h-3.5 w-24 bg-zinc-100 rounded" />
                                    </td>
                                    <td className="px-4 py-3 sm:px-5 hidden md:table-cell">
                                        <div className="h-3.5 w-20 bg-zinc-100 rounded" />
                                    </td>
                                    <td className="px-4 py-3 sm:px-5 hidden lg:table-cell">
                                        <div className="h-3.5 w-20 bg-zinc-100 rounded" />
                                    </td>
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="h-4 w-14 bg-zinc-100 rounded" />
                                    </td>
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="h-4 w-12 bg-zinc-100 rounded" />
                                    </td>
                                    <td className="px-4 py-3 sm:px-5 text-right">
                                        <div className="h-4 w-10 bg-zinc-100 rounded ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : paginatedClients.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                                    <p className="text-sm font-medium text-zinc-800">No matching clients found</p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        Try adjusting your search query or reset your filters.
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="mt-3 cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                                        >
                                            Reset filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            paginatedClients.map((client) => {
                                const avatar = getClientAvatar(client);
                                return (
                                    <tr
                                        key={client.client_id}
                                        className="hover:bg-zinc-50/70 transition-colors"
                                    >
                                        {/* Client Info */}
                                        <td className="px-4 py-2.5 sm:px-5">
                                            <div
                                                className="flex items-center gap-2.5 cursor-pointer group"
                                                onClick={() => router.push(`/client/${client.client_id}`)}
                                            >
                                                <img
                                                    src={avatar}
                                                    alt=""
                                                    className="h-8 w-8 rounded-full object-cover border border-zinc-200 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors truncate">
                                                        {client.full_name}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-400 truncate">
                                                        {client.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Company */}
                                        <td className="px-4 py-2.5 sm:px-5">
                                            <div className="min-w-0">
                                                <p className="font-medium text-zinc-800 truncate">
                                                    {client.company_name || "—"}
                                                </p>
                                                {client.website_url ? (
                                                    <a
                                                        href={client.website_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                                                    >
                                                        <Globe className="h-2.5 w-2.5" />
                                                        <span className="truncate max-w-28">Website</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-zinc-400">No site</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-4 py-2.5 sm:px-5 hidden md:table-cell text-zinc-600">
                                            {client.phone_number || "—"}
                                        </td>

                                        {/* Location */}
                                        <td className="px-4 py-2.5 sm:px-5 hidden lg:table-cell text-zinc-600">
                                            {client.city ? `${client.city}, ${client.country}` : client.country || "—"}
                                        </td>

                                        {/* Lead Stage */}
                                        <td className="px-4 py-2.5 sm:px-5">
                                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                                                {client.lead_stage || "New"}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-2.5 sm:px-5">
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
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-2.5 sm:px-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    title="View Profile"
                                                    onClick={() => router.push(`/client/${client.client_id}`)}
                                                    className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Edit Client"
                                                    onClick={() => setEditingClient(client)}
                                                    className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete Client"
                                                    onClick={() => handleDelete(client)}
                                                    className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-100 bg-zinc-50/50 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-zinc-400">|</span>
                    <span>
                        Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="px-2 font-medium text-zinc-700">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {editingClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs">
                    <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900">Edit Client Record</h3>
                                <p className="text-xs text-zinc-500">Update details for {editingClient.full_name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingClient(null)}
                                className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="max-h-[75vh] overflow-y-auto px-5 py-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        name="full_name"
                                        value={editingClient.full_name || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={editingClient.email || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Company</label>
                                    <input
                                        name="company_name"
                                        value={editingClient.company_name || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Phone</label>
                                    <input
                                        name="phone_number"
                                        value={editingClient.phone_number || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Website</label>
                                    <input
                                        name="website_url"
                                        value={editingClient.website_url || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={editingClient.status || "Pending"}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Lead Stage</label>
                                    <select
                                        name="lead_stage"
                                        value={editingClient.lead_stage || "New"}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Country</label>
                                    <input
                                        name="country"
                                        value={editingClient.country || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">City</label>
                                    <input
                                        name="city"
                                        value={editingClient.city || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Lead Source</label>
                                    <input
                                        name="lead_source"
                                        value={editingClient.lead_source || ""}
                                        onChange={handleUpdateChange}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingClient(null)}
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
