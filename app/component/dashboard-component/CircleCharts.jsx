"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import useSWR from "swr";
import { inter } from "@/app/fonts";

const fetcher = (url) => fetch(url).then((res) => res.json());

const COLORS = ["#0d9488", "#f59e0b", "#f43f5e", "#94a3b8"];

export default function CircleCharts() {
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

    const statusDistribution = useMemo(() => {
        if (list.length === 0) {
            return [
                { name: "Active", value: 0 },
                { name: "Pending", value: 0 },
                { name: "Closed", value: 0 },
            ];
        }
        const counts = {
            Active: list.filter((c) => c.status === "Active").length,
            Pending: list.filter((c) => c.status === "Pending").length,
            Closed: list.filter((c) => c.status === "Closed").length,
        };
        return [
            { name: "Active", value: counts.Active },
            { name: "Pending", value: counts.Pending },
            { name: "Closed", value: counts.Closed },
        ];
    }, [list]);

    if (isLoading) {
        return (
            <div
                className={`flex min-h-65 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 ring-1 ring-white/80 ${inter.className}`}
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Loading
                    </p>
                </div>
            </div>
        );
    }

    const hasData = list.length > 0;

    const newLocal = "relative min-h-45 flex-1 px-1.5 pb-2 pt-1.5 sm:min-h-50";
    return (
        <div
            className={`flex min-h-65 w-full min-w-0 max-w-full flex-col overflow-x-clip overflow-y-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm sm:min-h-[280px] md:min-h-[300px] ${inter.className}`}
        >
            <div className="border-b border-slate-100/90 px-2.5 py-2.5 sm:px-4 sm:py-3">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                    Lead distribution
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                    Status breakdown from client records
                </p>
            </div>

            <div className={newLocal}>
                {!hasData ? (
                    <div className="flex h-full min-h-40 flex-col items-center justify-center px-4 text-center">
                        <p className="text-xs font-medium text-slate-600 sm:text-sm">
                            No clients yet
                        </p>
                        <p className="mt-1.5 max-w-50 text-[11px] leading-snug text-slate-400">
                            Add clients to see status split.
                        </p>
                    </div>
                ) : (
                    <div className="relative mx-auto h-45 w-full max-w-55 min-w-0 sm:h-50 sm:max-w-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="58%"
                                    outerRadius="82%"
                                    paddingAngle={3}
                                    stroke="none"
                                    cornerRadius={4}
                                >
                                    {statusDistribution.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORS[index % COLORS.length]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor:
                                            "rgba(255,255,255,0.96)",
                                        borderRadius: "10px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow:
                                            "0 12px 28px -8px rgb(15 23 42 / 0.12)",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
                                {list.length}
                            </span>
                            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                                Total
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {hasData && (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-slate-100/90 px-2 py-2 sm:px-3">
                    {statusDistribution.map((item, index) => (
                        <div
                            key={item.name}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        COLORS[index % COLORS.length],
                                }}
                            />
                            <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                                {item.name}
                                <span className="ml-0.5 tabular-nums text-slate-400">
                                    ({item.value})
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
