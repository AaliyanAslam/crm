"use client";

import React, { useMemo } from "react";
import { inter } from "@/app/fonts";
import {
    Users,
    UserCheck,
    Clock,
    UserMinus,
    ChevronDown,
    Download,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ActiveStrip() {
    const { data: clientsData = [], isLoading } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000,
        focusThrottleInterval: 300000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        fallbackData: [],
    });

    const list = Array.isArray(clientsData) ? clientsData : [];

    const stats = useMemo(() => {
        if (list.length === 0) {
            return { total: 0, active: 0, pending: 0, closed: 0 };
        }
        return {
            total: list.length,
            active: list.filter((c) => c.status === "Active").length,
            pending: list.filter((c) => c.status === "Pending").length,
            closed: list.filter((c) => c.status === "Closed").length,
        };
    }, [list]);

    if (isLoading) {
        return (
            <div
                className={`grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 ${inter.className}`}
            >
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-white/80 ring-1 ring-slate-200/60"
                    />
                ))}
            </div>
        );
    }

    return (
        <section
            className={`w-full min-w-0 max-w-full overflow-x-clip rounded-xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm ${inter.className}`}
        >
            <div className="border-b border-slate-100/90 bg-linear-to-b from-white to-slate-50/50 px-2.5 py-3 sm:px-4 sm:py-3.5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                            Client performance
                        </h2>
                        <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                            Live counts from your directory
                        </p>
                    </div>
                    <div className="flex w-full min-w-0 flex-wrap gap-1.5 sm:w-auto sm:justify-end">
                        <button
                            type="button"
                            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex-initial"
                        >
                            <span className="truncate">Last 30 days</span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        </button>
                        <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:flex-initial"
                        >
                            <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 sm:gap-2.5 sm:p-3 lg:grid-cols-4">
                <StatBox
                    label="Total clients"
                    value={stats.total}
                    icon={<Users className="h-4 w-4" strokeWidth={2} />}
                    accent="sky"
                />
                <StatBox
                    label="Active"
                    value={stats.active}
                    icon={<UserCheck className="h-4 w-4" strokeWidth={2} />}
                    accent="violet"
                />
                <StatBox
                    label="Pending"
                    value={stats.pending}
                    icon={<Clock className="h-4 w-4" strokeWidth={2} />}
                    accent="amber"
                />
                <StatBox
                    label="Closed"
                    value={stats.closed}
                    icon={<UserMinus className="h-4 w-4" strokeWidth={2} />}
                    accent="emerald"
                />
            </div>
        </section>
    );
}

const accentStyles = {
    sky: "bg-sky-50 text-sky-600 ring-sky-100/80",
    violet: "bg-violet-50 text-violet-600 ring-violet-100/80",
    amber: "bg-amber-50 text-amber-600 ring-amber-100/80",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100/80",
};

function StatBox({ label, value, icon, accent }) {
    const ring = accentStyles[accent] || accentStyles.sky;
    const display =
        value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

    return (
        <div className="group min-w-0 rounded-xl border border-slate-100/90 bg-slate-50/40 p-3 transition hover:border-teal-200/50 hover:bg-white hover:shadow-sm hover:shadow-slate-200/40 sm:p-3.5">
            <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium text-slate-600 sm:text-xs">
                    {label}
                </p>
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${ring}`}
                >
                    {icon}
                </div>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                {display}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                In workspace
            </p>
        </div>
    );
}
