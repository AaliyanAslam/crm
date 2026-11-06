"use client";

import React from "react";
import { MessageSquare, Hash, AtSign, CornerDownLeft } from "lucide-react";
import { inter } from "@/app/fonts";

export default function ChatsIndexPage() {
    return (
        <div
            className={`flex h-full min-h-0 min-w-0 max-w-full flex-1 flex-col items-center justify-center bg-zinc-50/60 px-4 py-8 text-center sm:px-6 md:px-8 ${inter.className}`}
        >
            <div className="relative flex max-w-md flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200/90 bg-white shadow-xs">
                    <MessageSquare className="h-6 w-6 text-zinc-800" strokeWidth={2} />
                </div>

                <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                    Select a conversation
                </h2>
                <p className="mt-1.5 text-xs text-zinc-500 max-w-sm leading-relaxed">
                    Choose a channel from the sidebar to view active discussions, or click <strong className="text-zinc-700">+</strong> to create a new team room.
                </p>

                {/* Quick Shortcuts */}
                <div className="mt-6 grid grid-cols-1 gap-2.5 w-full text-left sm:grid-cols-2">
                    <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-xs">
                        <Hash className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-zinc-900">Team Channels</p>
                            <p className="text-[11px] text-zinc-500">Organized topic-based rooms for all projects</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-xs">
                        <AtSign className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-zinc-900">Direct Mentions</p>
                            <p className="text-[11px] text-zinc-500">Type @name to highlight messages for teammates</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-xs sm:col-span-2">
                        <CornerDownLeft className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-zinc-900">Fast Messaging</p>
                            <p className="text-[11px] text-zinc-500">Press Enter to send instantly, or Shift + Enter for multiline notes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
