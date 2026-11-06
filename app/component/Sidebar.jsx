"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Kanban,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
} from "lucide-react";
import { inter } from "../fonts";
import { useUser } from "../hooks/useUser";
import { useSettings } from "../hooks/useSettings";
import { toast } from "sonner";

export default function Sidebar() {
    const pathname = usePathname() || "";
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user } = useUser();
    const { settings } = useSettings();

    const menuItems = [
        { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "clients", href: "/clients", label: "Clients", icon: Users },
        { id: "projects", href: "/projects", label: "Projects", icon: Briefcase },
        { id: "boards", href: "/boards", label: "Boards", icon: Kanban },
        { id: "chats", href: "/chats", label: "Chats", icon: MessageSquare },
        { id: "settings", href: "/settings", label: "Settings", icon: Settings },
    ];

    const isExpanded = isHovered || isMobileOpen;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMobileOpen(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") setIsMobileOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileOpen]);

    const handleLogout = async () => {
        try {
            toast.loading("Signing out...");
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = "/login";
            } else {
                toast.error(data.message || "Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            toast.error("Logout failed. Please try again.");
        }
    };

    // Presence status styling
    const userStatus = user?.settings?.status || "Available";
    const getStatusDotColor = (status) => {
        switch (status) {
            case "In a Meeting":
                return "bg-purple-500";
            case "Away":
                return "bg-amber-500";
            case "Do Not Disturb":
                return "bg-rose-500";
            case "Available":
            default:
                return "bg-emerald-500";
        }
    };

    const isProfileActive = pathname.startsWith("/profile");

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className={inter.className}>
            {/* Mobile Top Navigation Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <Image
                            src="/logo/dklogo.png"
                            alt="Devskarnel"
                            width={30}
                            height={30}
                            className="rounded-md object-contain"
                            priority
                        />
                        <span className="text-sm font-semibold text-zinc-900 tracking-tight truncate max-w-[180px]">
                            {settings?.workspaceName || "Devskarnel CRM"}
                        </span>
                    </div>
                </div>

                {user && (
                    <button
                        onClick={() => router.push("/profile")}
                        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-zinc-200 transition-all cursor-pointer"
                        title="Your Profile"
                    >
                        <div className="relative">
                            {user?.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={user.image}
                                    alt={user?.name || "Avatar"}
                                    className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center">
                                    {getInitials(user?.name)}
                                </div>
                            )}
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${getStatusDotColor(
                                    userStatus
                                )}`}
                            />
                        </div>
                    </button>
                )}
            </div>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${
                    isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Main Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-dvh bg-white border-r border-zinc-200/90 z-50
                    flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0"}
                    ${isHovered ? "md:w-64 md:shadow-xl md:shadow-zinc-900/5" : "md:w-20"}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-3.5 p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>

                {/* Workspace Header */}
                <div className="shrink-0 px-4 h-20 border-b border-zinc-100 flex items-center">
                    <Link
                        href="/dashboard"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3.5 group cursor-pointer w-full overflow-hidden"
                    >
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200/70 group-hover:border-zinc-300 transition-colors">
                            <Image
                                src="/logo/dklogo.png"
                                alt="Devskarnel"
                                width={30}
                                height={30}
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div
                            className={`flex flex-col min-w-0 transition-all duration-300 ${
                                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                            }`}
                        >
                            <span className="text-xs font-semibold text-zinc-900 tracking-tight truncate">
                                {settings?.workspaceName || "Devskarnel"}
                            </span>
                            <span className="text-[11px] font-normal text-zinc-400 tracking-normal truncate">
                                CRM Workspace
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.id === "chats"
                                ? pathname.startsWith("/chats") || pathname.startsWith("/chat")
                                : item.id === "boards"
                                ? pathname.startsWith("/boards") || pathname.startsWith("/board")
                                : item.id === "clients"
                                ? pathname.startsWith("/clients") || pathname.startsWith("/client")
                                : item.id === "projects"
                                ? pathname.startsWith("/projects") || pathname.startsWith("/project")
                                : item.id === "settings"
                                ? pathname.startsWith("/settings")
                                : pathname === item.href || (pathname === "/" && item.id === "dashboard");

                        return (
                            <div key={item.id} className="relative group">
                                {/* Desktop Hover Tooltip (collapsed mode only) */}
                                {!isExpanded && (
                                    <div className="hidden md:flex items-center absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-md shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                                        {item.label}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                                    </div>
                                )}

                                <Link
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                                        relative flex items-center h-10 px-2 rounded-lg transition-all duration-150
                                        ${
                                            isActive
                                                ? "bg-zinc-100 text-zinc-950 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50/80 font-medium"
                                        }
                                    `}
                                >
                                    {/* Active Left Indicator Bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-zinc-950 rounded-r-full" />
                                    )}

                                    {/* Centered Icon Container */}
                                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                        <Icon
                                            size={19}
                                            strokeWidth={isActive ? 2.3 : 1.9}
                                            className={isActive ? "text-zinc-950" : "text-zinc-500 group-hover:text-zinc-900 transition-colors"}
                                        />
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`text-sm whitespace-nowrap transition-all duration-300 ml-1.5 ${
                                            isExpanded
                                                ? "opacity-100 w-auto"
                                                : "opacity-0 w-0 overflow-hidden"
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom Footer Actions (Profile & Signout) */}
                <div className="shrink-0 px-3 py-3 border-t border-zinc-100 space-y-1 bg-white">
                    {/* User Profile Button */}
                    <div className="relative group">
                        {!isExpanded && (
                            <div className="hidden md:flex items-center absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-md shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                                Profile & Settings
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileOpen(false);
                                router.push("/profile");
                            }}
                            className={`
                                cursor-pointer w-full flex items-center h-12 px-2 rounded-lg transition-all duration-150 text-left
                                ${
                                    isProfileActive
                                        ? "bg-zinc-100 text-zinc-950 font-semibold"
                                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50/80"
                                }
                            `}
                        >
                            {isProfileActive && (
                                <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-zinc-950 rounded-r-full" />
                            )}

                            {/* Avatar with Presence Indicator */}
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center relative">
                                {user?.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={user.image}
                                        alt={user?.name || "Profile"}
                                        className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center">
                                        {user ? getInitials(user?.name) : <UserIcon size={15} />}
                                    </div>
                                )}
                                <span
                                    className={`absolute right-1 bottom-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${getStatusDotColor(
                                        userStatus
                                    )}`}
                                    title={`Status: ${userStatus}`}
                                />
                            </div>

                            {/* User details */}
                            <div
                                className={`flex flex-col min-w-0 transition-all duration-300 ml-1.5 ${
                                    isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                                }`}
                            >
                                <span className="text-xs font-semibold text-zinc-900 truncate">
                                    {user?.name || "Account Profile"}
                                </span>
                                <span className="text-[11px] text-zinc-400 truncate">
                                    {user?.settings?.designation || user?.role || "Member"}
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Sign Out Button */}
                    {user && (
                        <div className="relative group">
                            {!isExpanded && (
                                <div className="hidden md:flex items-center absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-md shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                                    Log out
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="cursor-pointer w-full flex items-center h-10 px-2 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50/70 transition-all duration-150"
                            >
                                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                    <LogOut size={18} strokeWidth={1.9} />
                                </div>

                                <span
                                    className={`text-xs font-medium whitespace-nowrap transition-all duration-300 ml-1.5 ${
                                        isExpanded
                                            ? "opacity-100 w-auto"
                                            : "opacity-0 w-0 overflow-hidden"
                                    }`}
                                >
                                    Log out
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Desktop layout spacer */}
            <div className={`hidden md:block transition-all duration-300 shrink-0 ${isHovered ? "w-64" : "w-20"}`} />

            {/* Mobile content spacer */}
            <div className="md:hidden h-16 shrink-0" />
        </div>
    );
}
