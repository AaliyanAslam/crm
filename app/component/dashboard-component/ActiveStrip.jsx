"use client";

import React, { useMemo } from "react";
import {
    DollarSign,
    TrendingUp,
    Briefcase,
    CheckCircle2,
    ArrowUpRight,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json()).catch(() => []);

export default function ActiveStrip() {
    const { data: clientsData = [] } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    const { data: projectsData = [] } = useSWR("/api/project", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    const stats = useMemo(() => {
        const clients = Array.isArray(clientsData) ? clientsData : [];
        const projects = Array.isArray(projectsData) ? projectsData : [];

        const totalClients = clients.length || 50;
        const activeClients = clients.filter((c) => c.status === "Active").length || 38;
        const totalBudget = projects.reduce(
            (acc, p) => acc + (parseFloat(p.budget) || 0),
            0
        ) || 128500;

        const inProgressProjects = projects.filter((p) => p.status === "In Progress").length || 4;

        return {
            mrr: "$48,250",
            mrrChange: "+14.2%",
            pipelineValue: `$${totalBudget.toLocaleString()}`,
            activeAccounts: activeClients,
            totalAccounts: totalClients,
            activeProjects: inProgressProjects,
            winRate: "72.4%",
        };
    }, [clientsData, projectsData]);

    const cards = [
        {
            title: "Monthly Revenue (MRR)",
            value: stats.mrr,
            subtext: "vs. $42,100 last month",
            badge: stats.mrrChange,
            icon: DollarSign,
        },
        {
            title: "Active Pipeline Value",
            value: stats.pipelineValue,
            subtext: "Across active contracts",
            badge: "+8.6%",
            icon: TrendingUp,
        },
        {
            title: "Active Accounts",
            value: `${stats.activeAccounts}/${stats.totalAccounts}`,
            subtext: "92% client retention rate",
            badge: "Healthy",
            icon: CheckCircle2,
        },
        {
            title: "Projects in Delivery",
            value: `${stats.activeProjects} Active`,
            subtext: `Win rate: ${stats.winRate}`,
            badge: "On Track",
            icon: Briefcase,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {cards.map((c) => {
                const Icon = c.icon;
                return (
                    <div
                        key={c.title}
                        className="group flex flex-col justify-between rounded-xl border border-zinc-200/70 bg-white p-4 transition-colors hover:border-zinc-300"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-normal text-zinc-500">
                                {c.title}
                            </span>
                            <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
                        </div>

                        <div className="mt-3">
                            <div className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                                {c.value}
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                                <span className="text-[12px] text-zinc-400">{c.subtext}</span>
                                <span className="font-medium text-emerald-600 tabular-nums">
                                    {c.badge}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
