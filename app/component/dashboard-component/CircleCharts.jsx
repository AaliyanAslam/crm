"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const STATUS_CONFIG = {
    Active: {
        color: "#18181b",
        barColor: "bg-zinc-900",
        label: "Active Accounts",
    },
    Pending: {
        color: "#f59e0b",
        barColor: "bg-amber-500",
        label: "Pending Review",
    },
    Closed: {
        color: "#a1a1aa",
        barColor: "bg-zinc-400",
        label: "Closed / Archived",
    },
};

function CustomDonutTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-xl">
            <span className="font-medium text-zinc-300">{item.name}: </span>
            <span className="font-bold tabular-nums text-white">{item.value}</span>
        </div>
    );
}

export default function CircleCharts() {
    const { data: clientsData = [], isLoading } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000,
        focusThrottleInterval: 300000,
        fallbackData: [],
    });

    const { distribution, total } = useMemo(() => {
        const list = Array.isArray(clientsData) ? clientsData : [];
        const totalCount = list.length;
        const activeCount = list.filter((c) => c.status === "Active").length;
        const pendingCount = list.filter((c) => c.status === "Pending").length;
        const closedCount = list.filter((c) => c.status === "Closed").length;

        const data = [
            {
                name: "Active",
                value: activeCount,
                percent: totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0,
                color: STATUS_CONFIG.Active.color,
                barColor: STATUS_CONFIG.Active.barColor,
                label: STATUS_CONFIG.Active.label,
            },
            {
                name: "Pending",
                value: pendingCount,
                percent: totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0,
                color: STATUS_CONFIG.Pending.color,
                barColor: STATUS_CONFIG.Pending.barColor,
                label: STATUS_CONFIG.Pending.label,
            },
            {
                name: "Closed",
                value: closedCount,
                percent: totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0,
                color: STATUS_CONFIG.Closed.color,
                barColor: STATUS_CONFIG.Closed.barColor,
                label: STATUS_CONFIG.Closed.label,
            },
        ];

        return { distribution: data, total: totalCount };
    }, [clientsData]);

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[300px] flex-col rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
                <div className="h-4 w-32 animate-pulse rounded-md bg-zinc-100" />
                <div className="mx-auto my-auto h-36 w-36 animate-pulse rounded-full border-4 border-zinc-100" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="border-b border-zinc-100 pb-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                        Status Distribution
                    </h3>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                        {total} Total
                    </span>
                </div>
                <p className="mt-0.5 text-[11px] sm:text-xs text-zinc-500">
                    Client account breakdown by active status
                </p>
            </div>

            <div className="relative my-2 flex h-36 sm:h-40 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={distribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={64}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {distribution.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomDonutTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold tabular-nums text-zinc-900">
                        {total}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                        Clients
                    </span>
                </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                {distribution.map((item) => (
                    <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-zinc-600 text-[11px] sm:text-xs font-medium">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                                <span className="font-semibold text-zinc-900 tabular-nums">
                                    {item.value}
                                </span>
                                <span className="text-zinc-400">({item.percent}%)</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                            <div
                                className={`h-full ${item.barColor} transition-all duration-500 rounded-full`}
                                style={{ width: `${item.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
