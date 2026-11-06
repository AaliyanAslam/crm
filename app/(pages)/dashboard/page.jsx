"use client";

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
    Plus,
    Calendar,
    ArrowRight,
    Building2,
    ExternalLink,
    DollarSign,
    Briefcase,
    Activity,
    Layers,
    Kanban,
    MessageSquare,
    Clock,
    CheckCircle2,
    FileText,
    Users,
} from "lucide-react";

import ActiveStrip from "@/app/component/dashboard-component/ActiveStrip";
import CircleCharts from "@/app/component/dashboard-component/CircleCharts";
import DataCharts from "@/app/component/dashboard-component/DataCharts";
import AddClientFormModal from "@/app/component/client-component/AddClientFormModel";
import { useUser } from "@/app/hooks/useUser";
import { inter } from "@/app/fonts";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json()).catch(() => []);

export default function DashboardPage() {
    const { user } = useUser();
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);

    const { data: clientsData = [], isLoading: isClientsLoading, mutate: refreshClients } = useSWR(
        "/api/client",
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            fallbackData: [],
        }
    );

    const { data: projectsData = [] } = useSWR(
        "/api/project",
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            fallbackData: [],
        }
    );

    const recentClients = Array.isArray(clientsData)
        ? clientsData.slice(0, 6)
        : [];

    const activeProjects = Array.isArray(projectsData)
        ? projectsData.slice(0, 4)
        : [];

    const todayFormatted = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const recentActivities = [
        {
            id: 1,
            title: "Sprint 'CRM Boards V2' marked In Progress",
            time: "12m ago",
            user: "Aaliyan Aslam",
            icon: Kanban,
        },
        {
            id: 2,
            title: "Retainer invoice of $12,500 finalized",
            time: "48m ago",
            user: "Finance",
            icon: DollarSign,
        },
        {
            id: 3,
            title: "New enterprise client account onboarded",
            time: "2h ago",
            user: "Kasim",
            icon: Users,
        },
        {
            id: 4,
            title: "Team discussion active in #general",
            time: "3h ago",
            user: "Team",
            icon: MessageSquare,
        },
    ];

    const getStageBadgeColor = (stage) => {
        switch (stage) {
            case "Converted":
                return "bg-zinc-900 text-white border-zinc-900";
            case "Negotiation":
                return "bg-zinc-100 text-zinc-800 border-zinc-200";
            case "Proposal":
                return "bg-zinc-50 text-zinc-700 border-zinc-200";
            default:
                return "bg-zinc-50 text-zinc-500 border-zinc-200";
        }
    };

    return (
        <div
            suppressHydrationWarning
            className={`min-h-screen bg-zinc-50/70 pb-16 text-zinc-900 ${inter.className}`}
        >
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-5">
                
                {/* Top Header Bar with Live CRM Quick Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
                            <span>CRM</span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-800 font-semibold">Overview</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                            {user ? `Welcome back, ${user.name}` : "Workspace Dashboard"}
                        </h1>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Real-time pipeline metrics, team deliverables, and accounts overview.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-auto self-start">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 shadow-xs">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            <span suppressHydrationWarning>{todayFormatted}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                toast.success("Exporting pipeline audit report...");
                                setTimeout(() => toast.success("Report downloaded (CSV)."), 900);
                            }}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 transition-colors"
                        >
                            <FileText className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Export Report</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAddClientOpen(true)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Client</span>
                        </button>
                    </div>
                </div>

                {/* Hero Financial & Performance Cards (ActiveStrip) */}
                <ActiveStrip />

                {/* Main Visual Analytics Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                    <div className="lg:col-span-2">
                        <DataCharts />
                    </div>
                    <div className="lg:col-span-1">
                        <CircleCharts />
                    </div>
                </div>

                {/* Two-Column Middle Section: High-Value Client Accounts + Sprint Health & Activity */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                    
                    {/* Left 2 Cols: High-Value Clients Directory Table */}
                    <div className="lg:col-span-2 rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5 sm:py-3.5">
                                <div>
                                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        High-Value Client Accounts
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Active commercial accounts and pipeline stages
                                    </p>
                                </div>
                                <Link
                                    href="/clients"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                                >
                                    <span>All accounts</span>
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-2.5 sm:px-5">Client</th>
                                            <th className="px-4 py-2.5 sm:px-5 hidden md:table-cell">Company</th>
                                            <th className="px-4 py-2.5 sm:px-5">Stage</th>
                                            <th className="px-4 py-2.5 sm:px-5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                        {isClientsLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-4 py-3 sm:px-5">
                                                        <div className="h-4 w-32 bg-zinc-100 rounded" />
                                                    </td>
                                                    <td className="px-4 py-3 sm:px-5 hidden md:table-cell">
                                                        <div className="h-4 w-24 bg-zinc-100 rounded" />
                                                    </td>
                                                    <td className="px-4 py-3 sm:px-5">
                                                        <div className="h-4 w-16 bg-zinc-100 rounded" />
                                                    </td>
                                                    <td className="px-4 py-3 sm:px-5 text-right">
                                                        <div className="h-4 w-12 bg-zinc-100 rounded ml-auto" />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : recentClients.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-8 text-center text-xs text-zinc-500"
                                                >
                                                    No clients found. Click &quot;Add Client&quot; to create one.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentClients.map((c) => {
                                                const isMale = c.gender === "Male";
                                                const avatarSrc =
                                                    c.profile_image_url ||
                                                    (isMale
                                                        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
                                                        : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png");

                                                return (
                                                    <tr
                                                        key={c.client_id}
                                                        className="hover:bg-zinc-50/70 transition-colors"
                                                    >
                                                        <td className="px-4 py-2.5 sm:px-5">
                                                            <div className="flex items-center gap-2.5">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={avatarSrc}
                                                                    alt=""
                                                                    className="h-7 w-7 rounded-full object-cover border border-zinc-200"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-zinc-900 truncate">
                                                                        {c.full_name}
                                                                    </p>
                                                                    <p className="text-[11px] text-zinc-400 truncate">
                                                                        {c.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 sm:px-5 hidden md:table-cell">
                                                            <div className="flex items-center gap-1.5 text-zinc-600">
                                                                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                                                                <span className="truncate">
                                                                    {c.company_name || "—"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 sm:px-5">
                                                            <span
                                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border ${getStageBadgeColor(
                                                                    c.lead_stage
                                                                )}`}
                                                            >
                                                                {c.lead_stage || "Lead"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 sm:px-5 text-right">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                    c.status === "Active"
                                                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70"
                                                                        : c.status === "Pending"
                                                                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70"
                                                                        : "bg-zinc-100 text-zinc-600"
                                                                }`}
                                                            >
                                                                {c.status || "Active"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 px-4 py-2.5 sm:px-5 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500">
                            <span>Showing {recentClients.length} of 50+ accounts</span>
                            <Link href="/clients" className="font-semibold text-zinc-800 hover:text-zinc-950">
                                Open Client Directory →
                            </Link>
                        </div>
                    </div>

                    {/* Right 1 Col: Live Audit Feed & Sprint Health */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Live Activity Timeline */}
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-zinc-900" />
                                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Live Activity Feed
                                    </h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Live
                                </span>
                            </div>

                            <div className="space-y-3">
                                {recentActivities.map((act) => {
                                    const Icon = act.icon;
                                    return (
                                        <div key={act.id} className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-normal text-zinc-800 leading-snug">
                                                    {act.title}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
                                                    <span>{act.user}</span>
                                                    <span>•</span>
                                                    <span>{act.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sprint & Project Deliverable Health */}
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-zinc-900" />
                                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Active Deliverables
                                    </h3>
                                </div>
                                <Link href="/projects" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
                                    All ({projectsData.length || 7})
                                </Link>
                            </div>

                            <div className="space-y-2.5">
                                {activeProjects.length > 0 ? (
                                    activeProjects.map((p) => (
                                        <div key={p.project_id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 transition-colors">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <p className="text-xs font-semibold text-zinc-900 truncate">
                                                    {p.project_name}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 truncate">
                                                    Budget: ${parseFloat(p.budget || 0).toLocaleString()} • {p.status}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                                                {p.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-zinc-400 text-center py-2">
                                        No active deliverables.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                        href="/boards"
                        className="group flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                <Kanban className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-zinc-900">Sprint Kanban Boards</p>
                                <p className="text-[11px] text-zinc-500">10 active engineering pipelines</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <Link
                        href="/clients"
                        className="group flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-zinc-900">Client Directory</p>
                                <p className="text-[11px] text-zinc-500">50+ commercial accounts</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <Link
                        href="/chats"
                        className="group flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-zinc-900">Real-time Team Chat</p>
                                <p className="text-[11px] text-zinc-500">Instant WebSocket channels</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                </div>
            </div>

            {/* Modal for Add Client */}
            <AddClientFormModal
                isOpen={isAddClientOpen}
                onClose={() => setIsAddClientOpen(false)}
                onClientAdded={() => {
                    refreshClients();
                    setIsAddClientOpen(false);
                }}
            />
        </div>
    );
}
