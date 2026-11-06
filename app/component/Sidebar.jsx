"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    PanelLeftClose,
    PanelLeftOpen,
    FileCode2,
    UserCheck,
    ChevronRight,
} from "lucide-react";
import { inter } from "../fonts";
import { useUser } from "../hooks/useUser";
import { useSettings } from "../hooks/useSettings";
import { useSidebar } from "../context/SidebarContext";
import { toast } from "sonner";

export default function Sidebar() {
    const pathname = usePathname() || "";
    const router = useRouter();
    const { user } = useUser();
    const { settings } = useSettings();
    const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useSidebar();

    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = !isCollapsed || isHovered || isMobileOpen;

    // Close mobile menu on route change
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMobileOpen(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname, setIsMobileOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") setIsMobileOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [setIsMobileOpen]);

    // Mobile scroll lock
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

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Clean, concise navigation items without clutter
    const navigationSections = useMemo(
        () => [
            {
                section: "OVERVIEW",
                items: [
                    {
                        id: "dashboard",
                        href: "/dashboard",
                        label: "Dashboard",
                        icon: LayoutDashboard,
                    },
                ],
            },
            {
                section: "WORKSPACE",
                items: [
                    {
                        id: "clients",
                        href: "/clients",
                        label: "Clients",
                        icon: Users,
                    },
                    {
                        id: "projects",
                        href: "/projects",
                        label: "Projects",
                        icon: Briefcase,
                    },
                    {
                        id: "boards",
                        href: "/boards",
                        label: "Boards",
                        icon: Kanban,
                    },
                ],
            },
            {
                section: "COMMUNICATION",
                items: [
                    {
                        id: "chats",
                        href: "/chats",
                        label: "Chats",
                        icon: MessageSquare,
                    },
                ],
            },
            {
                section: "SYSTEM",
                items: [
                    {
                        id: "api-doc",
                        href: "/api-doc",
                        label: "API Docs",
                        icon: FileCode2,
                    },
                    {
                        id: "settings",
                        href: "/settings",
                        label: "Settings",
                        icon: Settings,
                    },
                    {
                        id: "profile",
                        href: "/profile",
                        label: "Profile",
                        icon: UserCheck,
                    },
                ],
            },
        ],
        []
    );

    const isProfileActive = pathname.startsWith("/profile");

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
                            alt="CRM"
                            width={32}
                            height={32}
                            className="rounded-lg object-contain"
                            priority
                        />
                        <span className="text-base font-bold text-zinc-900 tracking-tight truncate max-w-[180px]">
                            {settings?.workspaceName || "CRM"}
                        </span>
                    </div>
                </div>

                {user && (
                    <button
                        onClick={() => router.push("/profile")}
                        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-zinc-200 transition-all cursor-pointer"
                        title="Profile"
                    >
                        <div className="relative">
                            {user?.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={user.image}
                                    alt={user?.name || "Avatar"}
                                    className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center">
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
                    ${isCollapsed ? (isHovered ? "md:w-64 md:shadow-2xl" : "md:w-20") : "md:w-64"}
                `}
                onMouseEnter={() => {
                    if (isCollapsed) setIsHovered(true);
                }}
                onMouseLeave={() => {
                    if (isCollapsed) setIsHovered(false);
                }}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-3.5 p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>

                {/* Workspace Header */}
                <div className="shrink-0 px-4 h-18 border-b border-zinc-100 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3.5 group cursor-pointer overflow-hidden min-w-0 ${
                            !isExpanded ? "mx-auto" : ""
                        }`}
                    >
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 group-hover:border-zinc-300 transition-colors">
                            <Image
                                src="/logo/dklogo.png"
                                alt="CRM"
                                width={26}
                                height={26}
                                className="object-contain"
                                priority
                            />
                        </div>

                        {isExpanded && (
                            <div className="flex flex-col min-w-0 transition-all duration-300">
                                <span className="text-sm font-bold text-zinc-900 tracking-tight truncate">
                                    {settings?.workspaceName || "CRM"}
                                </span>
                                <span className="text-xs font-normal text-zinc-400 tracking-normal truncate">
                                    Workspace
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Toggle Button */}
                    {isExpanded && (
                        <button
                            type="button"
                            onClick={toggleCollapse}
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
                            title="Toggle sidebar"
                            aria-label="Toggle sidebar"
                        >
                            <PanelLeftClose size={18} strokeWidth={2} />
                        </button>
                    )}
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {navigationSections.map((group) => (
                        <div key={group.section} className="space-y-1">
                            {/* Section Header */}
                            {isExpanded && (
                                <div className="pt-2 pb-1 px-3 text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">
                                    {group.section}
                                </div>
                            )}

                            {/* Section Items */}
                            {group.items.map((item) => {
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
                                        : item.id === "api-doc"
                                        ? pathname.startsWith("/api-doc")
                                        : item.id === "profile"
                                        ? pathname.startsWith("/profile")
                                        : pathname === item.href ||
                                          (pathname === "/" && item.id === "dashboard");

                                return (
                                    <div key={item.id} className="relative group">
                                        {/* Desktop Tooltip (Collapsed mode) */}
                                        {!isExpanded && (
                                            <div className="hidden md:flex items-center gap-2 absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                                                <span>{item.label}</span>
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                                            </div>
                                        )}

                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                                relative flex items-center h-11 px-2.5 rounded-xl transition-all duration-150
                                                ${
                                                    isActive
                                                        ? "bg-zinc-900 text-white font-semibold shadow-xs"
                                                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/90 font-medium"
                                                }
                                            `}
                                        >
                                            {/* Centered Icon Container */}
                                            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                                <Icon
                                                    size={20}
                                                    strokeWidth={isActive ? 2.2 : 1.9}
                                                    className={
                                                        isActive
                                                            ? "text-white"
                                                            : "text-zinc-500 group-hover:text-zinc-900 transition-colors"
                                                    }
                                                />
                                            </div>

                                            {/* Label */}
                                            <span
                                                className={`text-[14px] font-medium tracking-normal truncate transition-all duration-300 ml-2.5 ${
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
                        </div>
                    ))}
                </nav>

                {/* Bottom Footer Actions (Profile & Collapse Bar) */}
                <div className="shrink-0 px-3 py-3 border-t border-zinc-100 space-y-1.5 bg-white">
                    {/* User Profile Button */}
                    <div className="relative group">
                        {!isExpanded && (
                            <div className="hidden md:flex items-center absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                                Profile
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
                                cursor-pointer w-full flex items-center h-13 px-2 rounded-xl transition-all duration-150 text-left
                                ${
                                    isProfileActive
                                        ? "bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80"
                                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                                }
                            `}
                        >
                            {/* Avatar with Presence Indicator */}
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center relative">
                                {user?.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={user.image}
                                        alt={user?.name || "Profile"}
                                        className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center">
                                        {user ? getInitials(user?.name) : <UserIcon size={16} />}
                                    </div>
                                )}
                                <span
                                    className={`absolute right-0.5 bottom-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${getStatusDotColor(
                                        userStatus
                                    )}`}
                                    title={`Status: ${userStatus}`}
                                />
                            </div>

                            {/* User details */}
                            <div
                                className={`flex flex-col min-w-0 transition-all duration-300 ml-2.5 ${
                                    isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                                }`}
                            >
                                <span className="text-sm font-semibold text-zinc-900 truncate">
                                    {user?.name || "Profile"}
                                </span>
                                <span className="text-xs text-zinc-400 truncate">
                                    {user?.settings?.designation || user?.role || "Member"}
                                </span>
                            </div>

                            {isExpanded && (
                                <ChevronRight
                                    size={16}
                                    className="ml-auto text-zinc-400 shrink-0"
                                />
                            )}
                        </button>
                    </div>

                    {/* Bottom Quick Bar: Collapse Toggle (Desktop) & Log Out */}
                    <div className="flex items-center gap-1.5 pt-1">
                        {/* Tap to Toggle Button (when expanded) */}
                        {isExpanded ? (
                            <button
                                type="button"
                                onClick={toggleCollapse}
                                className="cursor-pointer flex-1 flex items-center gap-2 h-9 px-3 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors text-xs font-medium"
                                title="Collapse sidebar"
                            >
                                <PanelLeftClose size={16} />
                                <span>Collapse</span>
                            </button>
                        ) : (
                            /* Tap to Expand Button (when collapsed) */
                            <button
                                type="button"
                                onClick={toggleCollapse}
                                className="cursor-pointer hidden md:flex items-center justify-center w-full h-9 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                                title="Expand sidebar"
                                aria-label="Expand sidebar"
                            >
                                <PanelLeftOpen size={18} strokeWidth={2} />
                            </button>
                        )}

                        {/* Sign Out Button */}
                        {user && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className={`cursor-pointer flex items-center justify-center h-9 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                                    isExpanded ? "px-3" : "w-full"
                                }`}
                                title="Log out"
                            >
                                <LogOut size={17} strokeWidth={1.8} />
                                {isExpanded && (
                                    <span className="text-xs font-medium ml-1.5">
                                        Log out
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Content Spacer */}
            <div className="md:hidden h-16 shrink-0" />
        </div>
    );
}
