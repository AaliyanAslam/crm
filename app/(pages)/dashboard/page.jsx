"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import {
    LayoutGrid,
    MessageSquare,
    Users,
    Plus,
    Calendar,
    ArrowRight,
    Building2,
    ExternalLink,
} from "lucide-react";

import ActiveStrip from "@/app/component/dashboard-component/ActiveStrip";
import CircleCharts from "@/app/component/dashboard-component/CircleCharts";
import DataCharts from "@/app/component/dashboard-component/DataCharts";
import { useUser } from "@/app/hooks/useUser";
import { inter } from "@/app/fonts";

const fetcher = (url) => fetch(url).then((res) => res.json());

const quickNav = [
    {
        href: "/boards",
        label: "Project Boards",
        count: "Active Pipelines",
        icon: LayoutGrid,
    },
    {
        href: "/clients",
        label: "Client Directory",
        count: "50+ Accounts",
        icon: Users,
    },
    {
        href: "/chats",
        label: "Team Messages",
        count: "Direct & Rooms",
        icon: MessageSquare,
    },
];

export default function DashboardPage() {
    const { user } = useUser();

    const { data: clientsData = [], isLoading: isClientsLoading } = useSWR(
        "/api/client",
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            fallbackData: [],
        }
    );

    const recentClients = Array.isArray(clientsData)
        ? clientsData.slice(0, 5)
        : [];

    const todayFormatted = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div
            suppressHydrationWarning
            className={`min-h-screen bg-zinc-50/70 pb-12 text-zinc-900 ${inter.className}`}
        >
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-4 sm:space-y-5">
                
                {/* Top Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
                            <span>Devskarnel CRM</span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-800 font-semibold">Overview</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                            {user ? `Welcome back, ${user.name}` : "Workspace Dashboard"}
                        </h1>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Real-time client metrics, pipeline distribution, and team workspace.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-auto self-start">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 shadow-xs">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            <span suppressHydrationWarning>{todayFormatted}</span>
                        </div>

                        <Link
                            href="/clients"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Client</span>
                        </Link>
                    </div>
                </div>

                {/* Compact Quick Access Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {quickNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-zinc-800 truncate">
                                            {item.label}
                                        </p>
                                        <p className="text-[10px] text-zinc-400">
                                            {item.count}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        );
                    })}
                </div>

                {/* KPI Metrics Strip */}
                <ActiveStrip />

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                    <div className="lg:col-span-2">
                        <DataCharts />
                    </div>
                    <div className="lg:col-span-1">
                        <CircleCharts />
                    </div>
                </div>

                {/* Recent Clients Section (Compact Google/Shadcn style table) */}
                <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5 sm:py-3.5">
                        <div>
                            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                                Recent Client Registrations
                            </h3>
                            <p className="text-[11px] sm:text-xs text-zinc-500">
                                Latest accounts synchronized into the directory
                            </p>
                        </div>
                        <Link
                            href="/clients"
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                            <span>View all clients</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-2.5 sm:px-5">Client</th>
                                    <th className="px-4 py-2.5 sm:px-5 hidden md:table-cell">Company</th>
                                    <th className="px-4 py-2.5 sm:px-5 hidden sm:table-cell">Location</th>
                                    <th className="px-4 py-2.5 sm:px-5">Lead Stage</th>
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
                                            <td className="px-4 py-3 sm:px-5 hidden sm:table-cell">
                                                <div className="h-4 w-20 bg-zinc-100 rounded" />
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
                                            colSpan={5}
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
                                                <td className="px-4 py-2.5 sm:px-5 hidden sm:table-cell text-zinc-500">
                                                    {c.city ? `${c.city}, ${c.country}` : c.country || "—"}
                                                </td>
                                                <td className="px-4 py-2.5 sm:px-5">
                                                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                                                        {c.lead_stage || "New"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 sm:px-5 text-right">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                            c.status === "Active"
                                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                                                : c.status === "Pending"
                                                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                                                : "bg-zinc-100 text-zinc-600"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                c.status === "Active"
                                                                    ? "bg-emerald-500"
                                                                    : c.status === "Pending"
                                                                    ? "bg-amber-500"
                                                                    : "bg-zinc-400"
                                                            }`}
                                                        />
                                                        {c.status || "Pending"}
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

            </div>
        </div>
    );
}
