"use client";

import React, { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const dataMonthly = [
    { period: "Jan", revenue: 28400, target: 25000 },
    { period: "Feb", revenue: 32100, target: 28000 },
    { period: "Mar", revenue: 36800, target: 32000 },
    { period: "Apr", revenue: 34500, target: 32000 },
    { period: "May", revenue: 41200, target: 36000 },
    { period: "Jun", revenue: 44800, target: 40000 },
    { period: "Jul", revenue: 42900, target: 40000 },
    { period: "Aug", revenue: 47600, target: 42000 },
    { period: "Sep", revenue: 51200, target: 45000 },
    { period: "Oct", revenue: 49800, target: 45000 },
    { period: "Nov", revenue: 54600, target: 48000 },
    { period: "Dec", revenue: 58200, target: 50000 },
];

const dataWeekly = [
    { period: "W1", revenue: 11400, target: 10000 },
    { period: "W2", revenue: 13800, target: 11500 },
    { period: "W3", revenue: 12900, target: 11500 },
    { period: "W4", revenue: 16500, target: 13000 },
];

function CustomChartTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
            <p className="font-semibold text-zinc-900">{label}</p>
            <div className="mt-1 space-y-0.5">
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-zinc-500">
                            {entry.name === "revenue" ? "Realized Revenue" : "Target Quota"}
                        </span>
                        <span className="ml-auto font-medium tabular-nums text-zinc-900">
                            ${entry.value?.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DataCharts() {
    const [range, setRange] = useState("monthly");
    const activeData = range === "monthly" ? dataMonthly : dataWeekly;

    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-zinc-200/70 bg-white p-5">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Revenue vs. Target Quota
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Monthly realized invoice volume vs projected target
                    </p>
                </div>

                <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50/70 p-0.5 text-xs">
                    <button
                        type="button"
                        onClick={() => setRange("monthly")}
                        className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                            range === "monthly"
                                ? "bg-white text-zinc-900 shadow-xs font-medium"
                                : "text-zinc-500 hover:text-zinc-900"
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        onClick={() => setRange("weekly")}
                        className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                            range === "weekly"
                                ? "bg-white text-zinc-900 shadow-xs font-medium"
                                : "text-zinc-500 hover:text-zinc-900"
                        }`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={activeData}
                        margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18181b" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#18181b" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.04} />
                                <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f4f4f5"
                        />
                        <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                            tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="target"
                            stroke="#a1a1aa"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            fillOpacity={1}
                            fill="url(#targetGrad)"
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#18181b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#revenueGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Chart Footer Legend */}
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-900" />
                        <span>Realized Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-400" />
                        <span>Target Quota</span>
                    </div>
                </div>

                <div className="font-medium text-zinc-700">
                    Total YTD: <span className="font-semibold text-zinc-900 tabular-nums">$502,300</span>
                </div>
            </div>
        </div>
    );
}
