"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { inter } from "@/app/fonts";

const data = [
    { name: "Jan", uv: 4000, pv: 2400 },
    { name: "Feb", uv: 3000, pv: 1398 },
    { name: "Mar", uv: 2000, pv: 9800 },
    { name: "Apr", uv: 2780, pv: 3908 },
    { name: "May", uv: 1890, pv: 4800 },
    { name: "Jun", uv: 2390, pv: 3800 },
    { name: "Jul", uv: 3490, pv: 4300 },
];

export default function DataCharts() {
    return (
        <div
            className={`flex min-h-65 w-full min-w-0 max-w-full flex-col overflow-x-clip overflow-y-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm sm:min-h-70 md:min-h-75 ${inter.className}`}
        >
            <div className="border-b border-slate-100/90 px-2.5 py-2.5 sm:px-4 sm:py-3">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                    Revenue overview
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">
                    Sample trend — connect billing for live data.
                </p>
            </div>
            <div className="min-h-0 w-full min-w-0 flex-1 px-1 pb-2 pt-1 sm:px-3 sm:pb-3 sm:pt-1.5">
                <div className="h-50 w-full min-w-0 sm:h-55 md:h-60 lg:h-65">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 6, right: 8, left: -18, bottom: 2 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 10 }}
                                dy={6}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 10 }}
                                width={32}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(255,255,255,0.96)",
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow:
                                        "0 12px 28px -8px rgb(15 23 42 / 0.12)",
                                    padding: "8px 10px",
                                }}
                                labelStyle={{
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    marginBottom: 2,
                                    fontSize: "11px",
                                }}
                                itemStyle={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "#334155",
                                }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: "8px",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    color: "#64748b",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="pv"
                                name="Pipeline"
                                stroke="#0d9488"
                                strokeWidth={2}
                                dot={{
                                    r: 2.5,
                                    fill: "#0d9488",
                                    strokeWidth: 1.5,
                                    stroke: "#fff",
                                }}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="uv"
                                name="Volume"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{
                                    r: 2.5,
                                    fill: "#6366f1",
                                    strokeWidth: 1.5,
                                    stroke: "#fff",
                                }}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
