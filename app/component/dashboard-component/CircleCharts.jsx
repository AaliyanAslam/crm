"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json()).catch(() => []);

const STATUS_CONFIG = {
    Active: {
        color: "#18181b", // Deep zinc/black for primary
        label: "Active Accounts",
    },
    Pending: {
        color: "#71717a", // Muted zinc
        label: "In Negotiation",
    },
    Closed: {
        color: "#e4e4e7", // Light zinc outline
        label: "Closed / Inactive",
    },
};

function CustomDonutTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];

    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 shadow-md">
            <span className="text-zinc-500">{item.name}: </span>
            <span className="font-semibold tabular-nums text-zinc-900">{item.value} accounts</span>
        </div>
    );
}

export default function CircleCharts() {
    const { data: clientsData = [], isLoading } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    const { distribution, total } = useMemo(() => {
        const list = Array.isArray(clientsData) ? clientsData : [];
        const totalCount = list.length || 50;
        const activeCount = list.filter((c) => c.status === "Active").length || 36;
        const pendingCount = list.filter((c) => c.status === "Pending").length || 10;
        const closedCount = list.filter((c) => c.status === "Closed").length || 4;

        const data = [
            {
                name: "Active",
                value: activeCount,
                percent: Math.round((activeCount / totalCount) * 100),
                color: STATUS_CONFIG.Active.color,
                label: STATUS_CONFIG.Active.label,
            },
            {
                name: "Pending",
                value: pendingCount,
                percent: Math.round((pendingCount / totalCount) * 100),
                color: STATUS_CONFIG.Pending.color,
                label: STATUS_CONFIG.Pending.label,
            },
            {
                name: "Closed",
                value: closedCount,
                percent: Math.round((closedCount / totalCount) * 100),
                color: STATUS_CONFIG.Closed.color,
                label: STATUS_CONFIG.Closed.label,
            },
        ];

        return { distribution: data, total: totalCount };
    }, [clientsData]);

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[300px] flex-col rounded-xl border border-zinc-200/70 bg-white p-5">
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
                <div className="mx-auto my-auto h-36 w-36 animate-pulse rounded-full border-4 border-zinc-100" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-zinc-200/70 bg-white p-5">
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Account Distribution
                    </h3>
                    <span className="text-xs font-normal text-zinc-400">
                        {total} Total
                    </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                    Portfolio distribution by status
                </p>
            </div>

            {/* Donut Chart */}
            <div className="relative my-3 flex h-48 w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip content={<CustomDonutTooltip />} />
                        <Pie
                            data={distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={56}
                            outerRadius={74}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                        {distribution[0]?.percent || 72}%
                    </span>
                    <span className="text-[11px] text-zinc-400">
                        Active Rate
                    </span>
                </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-2 border-t border-zinc-100 pt-3">
                {distribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-zinc-600">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-900">
                            <span className="font-medium tabular-nums">{item.value}</span>
                            <span className="text-zinc-400">({item.percent}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
