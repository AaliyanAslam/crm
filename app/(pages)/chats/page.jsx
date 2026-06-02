"use client";

import { MessageSquare } from "lucide-react";
import { inter } from "@/app/fonts";

export default function ChatsIndexPage() {
    return (
        <div
            className={`relative flex h-full min-h-0 min-w-0 max-w-full flex-1 basis-0 flex-col items-center justify-center overflow-x-clip overflow-y-auto overscroll-y-contain bg-linear-to-b from-slate-100 via-slate-50 to-teal-50/25 px-4 py-8 text-center sm:px-6 md:px-8 ${inter.className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_-8%,rgba(13,148,136,0.08),transparent)]"
                aria-hidden
            />
            <div className="relative flex max-w-sm flex-col items-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80">
                    <MessageSquare
                        className="text-teal-600"
                        size={30}
                        strokeWidth={1.75}
                    />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Select a conversation
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Choose a chat on the left to open messages, or create a new
                    room with the + button.
                </p>
            </div>
        </div>
    );
}
