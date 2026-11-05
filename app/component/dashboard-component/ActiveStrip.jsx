"use client";

import React, { useMemo } from "react";
import {
    Users,
    UserCheck,
    Clock,
    CheckCircle2,
    TrendingUp,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ActiveStrip() {
    const { data: clientsData = [], isLoading } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000,
        focusThrottleInterval: 300000,
        fallbackData: [],
    });

    const stats = useMemo(() => {
        const list = Array.isArray(clientsData) ? clientsData : [];
        const total = list.length;
        const active = list.filter((c) => c.status === "Active").length;
        const pending = list.filter((c) => c.status === "Pending").length;
        const closed = list.filter((c) => c.status === "Closed").length;
        const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

        return { total, active, pending, closed, activeRate };
    }, [clientsData]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-28 animate-pulse rounded-xl border border-zinc-200/70 bg-white p-4 shadow-xs"
                    />
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Total Clients",
            value: stats.total,
            subtext: "In database directory",
            badge: "+14.2%",
            badgeType: "positive",
            icon: Users,
        },
        {
            title: "Active Accounts",
            value: stats.active,
            subtext: `${stats.activeRate}% active rate`,
            badge: "Operational",
            badgeType: "neutral",
            icon: UserCheck,
        },
        {
            title: "Pending Leads",
            value: stats.pending,
            subtext: "Requires follow-up",
            badge: "In pipeline",
            badgeType: "warning",
            icon: Clock,
        },
        {
            title: "Closed / Inactive",
            value: stats.closed,
            subtext: "Archived records",
            badge: "Completed",
            badgeType: "neutral",
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {cards.map((c) => {
                const Icon = c.icon;
                return (
                    <div
                        key={c.title}
                        className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-3.5 sm:p-4 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 tracking-tight">
                                {c.title}
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-200/70">
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                                {c.value}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                                {c.badgeType === "positive" && (
                                    <span className="inline-flex items-center gap-0.5 rounded-sm bg-emerald-50 px-1 py-0.2 text-[10px] font-semibold text-emerald-700">
                                        <TrendingUp className="h-2.5 w-2.5" />
                                        {c.badge}
                                    </span>
                                )}
                                {c.badgeType === "warning" && (
                                    <span className="inline-flex items-center rounded-sm bg-amber-50 px-1 py-0.2 text-[10px] font-semibold text-amber-700">
                                        {c.badge}
                                    </span>
                                )}
                                {c.badgeType === "neutral" && (
                                    <span className="inline-flex items-center rounded-sm bg-zinc-100 px-1 py-0.2 text-[10px] font-semibold text-zinc-600">
                                        {c.badge}
                                    </span>
                                )}
                                <span className="truncate text-zinc-400">
                                    {c.subtext}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
