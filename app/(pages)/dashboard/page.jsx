"use client";

import ActiveStrip from "@/app/component/dashboard-component/ActiveStrip";
import CircleCharts from "@/app/component/dashboard-component/CircleCharts";
import DataCharts from "@/app/component/dashboard-component/DataCharts";
import Link from "next/link";
import React from "react";
import { useUser } from "@/app/hooks/useUser";
import { inter } from "@/app/fonts";
import {
    LayoutGrid,
    MessageSquare,
    Users,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";

const quickLinks = [
    {
        href: "/boards",
        label: "Boards",
        description: "Projects & tasks",
        icon: LayoutGrid,
    },
    {
        href: "/chats",
        label: "Messages",
        description: "Team chat",
        icon: MessageSquare,
    },
    {
        href: "/clients",
        label: "Clients",
        description: "Directory",
        icon: Users,
    },
];

export default function DashboardPage() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div
                className={`min-h-0 w-full min-w-0 max-w-full overflow-x-clip bg-slate-50 ${inter.className}`}
            >
                <div
                    className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.06),transparent)]"
                    aria-hidden
                />
                <div className="relative mx-auto max-w-425 px-2.5 py-5 sm:px-4 sm:py-6 md:px-5">
                    <div className="mb-5 h-28 animate-pulse rounded-xl bg-white/80 ring-1 ring-slate-200/60" />
                    <div className="mb-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-lg bg-white/80 ring-1 ring-slate-200/50"
                            />
                        ))}
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="h-72 animate-pulse rounded-xl bg-white/80 ring-1 ring-slate-200/50 lg:col-span-2" />
                        <div className="h-72 animate-pulse rounded-xl bg-white/80 ring-1 ring-slate-200/50" />
                    </div>
                </div>
            </div>
        );
    }

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div
            className={`min-h-0 w-full min-w-0 max-w-full overflow-x-clip bg-linear-to-b from-slate-50 via-white to-slate-50/80 ${inter.className}`}
        >
            <div
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(13,148,136,0.07),transparent)]"
                aria-hidden
            />

            <div className="relative mx-auto max-w-425 px-2.5 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4 md:px-5">
                <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-teal-200/60 bg-teal-50/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                            <Sparkles
                                className="h-3 w-3 text-teal-600"
                                strokeWidth={2}
                            />
                            Overview
                        </div>
                        <h1 className="mt-2 wrap-break-word text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                            {user ? (
                                <>
                                    Hello,{" "}
                                    <span className="bg-linear-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent capitalize">
                                        {user.name?.trim() || "there"}
                                    </span>
                                </>
                            ) : (
                                "Welcome"
                            )}
                        </h1>
                        <p className="mt-1.5 max-w-xl text-xs leading-snug text-slate-500 sm:text-sm">
                            {user
                                ? "Workspace snapshot — clients, pipeline, and activity."
                                : "Sign in for live client metrics."}
                        </p>
                        <p className="mt-2 text-[11px] font-medium text-slate-400">
                            {today}
                        </p>
                    </div>

                    {user ? (
                        <div className="flex w-full shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm sm:w-auto sm:max-w-60">
                            <img
                                src={
                                    user.image ||
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                                }
                                alt=""
                                className="h-9 w-9 rounded-lg object-cover ring-2 ring-slate-100"
                            />
                            <div className="min-w-0 text-left">
                                <p className="truncate text-xs font-semibold text-slate-900 capitalize sm:text-[13px]">
                                    {user.name || "Member"}
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                    {user.email || "Signed in"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-slate-800 sm:w-auto sm:text-sm"
                        >
                            Sign in
                        </Link>
                    )}
                </header>

                <div className="mb-4 grid grid-cols-1 gap-2 sm:mb-5 sm:grid-cols-3 sm:gap-3">
                    {quickLinks.map(({ href, label, description, icon: Icon }) => (
                        <Link
                            key={href}
                            href={user ? href : "/login"}
                            className="group relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 p-2.5 shadow-sm shadow-slate-200/30 ring-1 ring-white/60 transition hover:border-teal-200/80 hover:shadow-md hover:shadow-teal-500/5 sm:gap-3 sm:p-3"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-teal-50 to-emerald-50 text-teal-700 ring-1 ring-teal-100/80 transition group-hover:from-teal-100 group-hover:to-emerald-100">
                                <Icon size={17} strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="text-sm font-semibold text-slate-900">
                                    {label}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    {description}
                                </p>
                            </div>
                            <ArrowUpRight
                                className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600"
                                strokeWidth={2}
                            />
                        </Link>
                    ))}
                </div>

                <div className="mb-4 sm:mb-5">
                    {user ? (
                        <ActiveStrip />
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center sm:px-5">
                            <p className="text-xs font-medium text-slate-600 sm:text-sm">
                                Client metrics appear after you sign in.
                            </p>
                            <Link
                                href="/login"
                                className="mt-3 inline-flex text-xs font-semibold text-teal-700 hover:underline sm:text-sm"
                            >
                                Go to login
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                    <div className="min-h-0 min-w-0 lg:col-span-2">
                        <DataCharts />
                    </div>
                    <div className="min-h-0 min-w-0 lg:col-span-1">
                        {user ? (
                            <CircleCharts />
                        ) : (
                            <div className="flex h-full min-h-60 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-xs text-slate-500 sm:text-sm">
                                Lead distribution unlocks when you’re signed in.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
