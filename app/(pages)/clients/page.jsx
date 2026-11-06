"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
    Plus,
    Download,
    Users,
    UserCheck,
    Clock,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";

import AddClientFormModal from "@/app/component/client-component/AddClientFormModel";
import ClientsDataTable from "@/app/component/client-component/ClientsDataTable";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: clientsData = [] } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    const list = Array.isArray(clientsData) ? clientsData : [];

    // Calculate metrics
    const stats = {
        total: list.length,
        active: list.filter((c) => c.status === "Active").length,
        pending: list.filter((c) => c.status === "Pending").length,
        converted: list.filter((c) => c.lead_stage === "Converted").length,
    };

    // Export to CSV helper
    const handleExportCSV = () => {
        if (!list || list.length === 0) {
            toast.error("No client records to export.");
            return;
        }

        const headers = [
            "ID",
            "Full Name",
            "Email",
            "Gender",
            "Status",
            "Phone Number",
            "Company Name",
            "Website",
            "Country",
            "State",
            "City",
            "Lead Source",
            "Lead Stage",
            "Created At",
        ];

        const rows = list.map((c) => [
            c.client_id,
            `"${(c.full_name || "").replace(/"/g, '""')}"`,
            `"${(c.email || "").replace(/"/g, '""')}"`,
            c.gender || "",
            c.status || "",
            `"${(c.phone_number || "").replace(/"/g, '""')}"`,
            `"${(c.company_name || "").replace(/"/g, '""')}"`,
            `"${(c.website_url || "").replace(/"/g, '""')}"`,
            `"${(c.country || "").replace(/"/g, '""')}"`,
            `"${(c.state || "").replace(/"/g, '""')}"`,
            `"${(c.city || "").replace(/"/g, '""')}"`,
            `"${(c.lead_source || "").replace(/"/g, '""')}"`,
            `"${(c.lead_stage || "").replace(/"/g, '""')}"`,
            `"${c.created_at || ""}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `clients_export_${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV export downloaded successfully.");
    };

    return (
        <div
            suppressHydrationWarning
            className={`min-h-screen bg-zinc-50/70 pb-16 text-zinc-900 ${inter.className}`}
        >
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-4 sm:space-y-5">
                
                {/* Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
                            <span>CRM</span>
                            <span className="text-zinc-300">/</span>
                            <span>Directory</span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-800 font-semibold">Clients</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                            Client Directory
                        </h1>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Manage client contacts, track sales pipeline status, and update account records.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-auto self-start">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 transition-colors"
                        >
                            <Download className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Export CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Client</span>
                        </button>
                    </div>
                </div>

                {/* Compact KPI Cards (Shadcn style) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Total Directory</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
                                <Users className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {stats.total}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">Synchronized records</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Active Accounts</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                                <UserCheck className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {stats.active}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">
                            {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of total` : "0%"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Pending Review</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                                <Clock className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {stats.pending}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">Awaiting engagement</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Converted Leads</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                                <TrendingUp className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {stats.converted}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">Closed & Won</p>
                    </div>
                </div>

                {/* Main Client Table Card */}
                <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
                    <ClientsDataTable />
                </div>

                {/* Add Client Modal */}
                <AddClientFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </div>
    );
}
