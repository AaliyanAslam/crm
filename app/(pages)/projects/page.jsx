"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
    Plus,
    Briefcase,
    CheckCircle2,
    Clock,
    DollarSign,
} from "lucide-react";
import { inter } from "@/app/fonts";

import AddProjectFormModal from "@/app/component/project-component/AddProjectFormModel";
import ProjectsData from "@/app/component/project-component/ProjectsData";
import { useSettings } from "@/app/hooks/useSettings";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectsPage() {
    const { settings: appSettings, formatCurrency } = useSettings();
    const [showModal, setShowModal] = useState(false);

    const { data, mutate } = useSWR("/api/project", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: { projects: [] },
    });

    const projectsList = Array.isArray(data)
        ? data
        : data?.projects || data?.data || [];

    // Calculate metrics
    const totalProjects = projectsList.length;
    const inProgressCount = projectsList.filter((p) => p.status === "In Progress").length;
    const planningCount = projectsList.filter((p) => p.status === "Planning").length;
    const totalBudget = projectsList.reduce(
        (sum, p) => sum + (parseFloat(p.budget) || 0),
        0
    );

    return (
        <div
            suppressHydrationWarning
            className={`min-h-screen bg-zinc-50/70 pb-16 text-zinc-900 ${inter.className}`}
        >
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-4 sm:space-y-5">
                
                {/* Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
                            <span>{appSettings.workspaceName || "Devskarnel CRM"}</span>
                            <span className="text-zinc-300">/</span>
                            <span>Workspace</span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-800 font-semibold">Projects</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                            Projects Pipeline
                        </h1>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Manage client deliverables, budgets, sprint deadlines, and project statuses.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:self-auto self-start">
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>New Project</span>
                        </button>
                    </div>
                </div>

                {/* Compact KPI Cards (Shadcn style) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Total Projects</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
                                <Briefcase className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {totalProjects}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">All registered projects</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">In Progress</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {inProgressCount}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">Active engineering</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Planning & Queue</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                                <Clock className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {planningCount}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">Pre-development</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[11px] sm:text-xs font-medium">Pipeline Budget</span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                                <DollarSign className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {formatCurrency(totalBudget)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-400">Total pipeline allocation</p>
                    </div>
                </div>

                {/* Projects Main Data View */}
                <ProjectsData />

                {/* Create Project Modal */}
                <AddProjectFormModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => mutate()}
                />

            </div>
        </div>
    );
}
