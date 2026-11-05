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
    { period: "Jan", newLeads: 24, dealsClosed: 14 },
    { period: "Feb", newLeads: 31, dealsClosed: 18 },
    { period: "Mar", newLeads: 42, dealsClosed: 26 },
    { period: "Apr", newLeads: 38, dealsClosed: 22 },
    { period: "May", newLeads: 49, dealsClosed: 32 },
    { period: "Jun", newLeads: 58, dealsClosed: 39 },
    { period: "Jul", newLeads: 51, dealsClosed: 35 },
    { period: "Aug", newLeads: 62, dealsClosed: 44 },
    { period: "Sep", newLeads: 71, dealsClosed: 48 },
    { period: "Oct", newLeads: 65, dealsClosed: 43 },
    { period: "Nov", newLeads: 78, dealsClosed: 52 },
    { period: "Dec", newLeads: 85, dealsClosed: 59 },
];

const dataWeekly = [
    { period: "Mon", newLeads: 8, dealsClosed: 5 },
    { period: "Tue", newLeads: 12, dealsClosed: 7 },
    { period: "Wed", newLeads: 15, dealsClosed: 9 },
    { period: "Thu", newLeads: 11, dealsClosed: 8 },
    { period: "Fri", newLeads: 18, dealsClosed: 13 },
    { period: "Sat", newLeads: 7, dealsClosed: 4 },
    { period: "Sun", newLeads: 5, dealsClosed: 3 },
];

function CustomChartTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white shadow-xl">
            <p className="font-semibold text-zinc-300">{label}</p>
            <div className="mt-1.5 space-y-1">
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-zinc-400">
                            {entry.name === "newLeads" ? "New Inquiries" : "Converted"}
                        </span>
                        <span className="ml-auto font-medium tabular-nums text-white">
                            {entry.value}
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
        <div className="flex h-full flex-col rounded-xl border border-zinc-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-3">
                <div>
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                        Pipeline & Deal Volume
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500">
                        Client growth vs conversion velocity over time
                    </p>
                </div>

                <div className="flex items-center self-start sm:self-auto gap-1 rounded-lg bg-zinc-100/90 p-0.5 text-[11px] font-medium text-zinc-600">
                    <button
                        type="button"
                        onClick={() => setRange("weekly")}
                        className={`cursor-pointer rounded-md px-2.5 py-1 transition-all ${
                            range === "weekly"
                                ? "bg-white text-zinc-900 shadow-xs font-semibold"
                                : "hover:text-zinc-900"
                        }`}
                    >
                        7 Days
                    </button>
                    <button
                        type="button"
                        onClick={() => setRange("monthly")}
                        className={`cursor-pointer rounded-md px-2.5 py-1 transition-all ${
                            range === "monthly"
                                ? "bg-white text-zinc-900 shadow-xs font-semibold"
                                : "hover:text-zinc-900"
                        }`}
                    >
                        12 Months
                    </button>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-900" />
                    <span>New Inquiries</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                    <span>Converted Deals</span>
                </div>
            </div>

            <div className="mt-2 h-[220px] sm:h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={activeData}
                        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillNewLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18181b" stopOpacity={0.16} />
                                <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fillDeals" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.14} />
                                <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
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
                            tick={{ fill: "#71717a", fontSize: 11 }}
                            dy={6}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#71717a", fontSize: 11 }}
                            width={32}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="newLeads"
                            name="newLeads"
                            stroke="#18181b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#fillNewLeads)"
                        />
                        <Area
                            type="monotone"
                            dataKey="dealsClosed"
                            name="dealsClosed"
                            stroke="#71717a"
                            strokeWidth={1.75}
                            fillOpacity={1}
                            fill="url(#fillDeals)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
