"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuLayoutDashboard, LuMenu, LuX, LuMessageSquare } from "react-icons/lu";
import { IoSettingsOutline, IoBriefcaseOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { AiOutlineUser } from "react-icons/ai";
import { PiUsersThreeLight } from "react-icons/pi";
import { inter } from '../fonts';
import Image from 'next/image';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
const Sidebar = () => {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, loading } = useUser();
    const router = useRouter();

    const menuItems = [
        { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
        { id: 'clients', href: '/clients', label: 'Clients', icon: PiUsersThreeLight },
        { id: 'projects', href: '/projects', label: 'Projects', icon: IoBriefcaseOutline },
        { id: 'settings', href: '/settings', label: 'Settings', icon: IoSettingsOutline }
    ];

    const isExpanded = isHovered || isMobileOpen;

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileOpen]);

    const handleLogout = async () => {
        try {
            const res = await fetch(`/api/auth/logout`, {
                method: 'POST'
            });

            const data = await res.json();
toast.loading("Logging out...");
            if (data.success) {

                window.location.href = '/login';
            } else {
                console.error("Logout failed:", data.message);
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <>
            <div className={` ${inter.className}`}>
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <LuMenu size={24} className="text-gray-900" />
                    </button>
                    <h1 className="ml-2 text-lg font-semibold text-gray-900">Devskarnel CRM</h1>
                </div>

                {/* Mobile Overlay */}
                <div
                    className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                    onClick={() => setIsMobileOpen(false)}
                />

                {/* Sidebar */}
                <aside
                    className={`
                    fixed top-0 left-0 h-dvh bg-white border-r border-gray-200 z-50 hover:shadow-2xl
                    flex flex-col transition-all duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                    ${isHovered ? 'md:w-64' : 'md:w-20'}
                `}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-50"
                        aria-label="Close menu"
                    >
                        <LuX size={20} className="text-gray-600" />
                    </button>

                    <div className="shrink-0 px-4 py-6 border-b border-gray-200 flex items-center h-20">
                        <div className="flex items-center gap-4">
                            <div>
                                <Image loading='eager' src="/logo/dklogo.png" alt="Devskarnel CRM" width={40} height={40} />
                            </div>

                            <div className={`flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-32' : 'opacity-0 w-0'
                                }`}>
                                <h1 className="text-gray-900 font-bold text-lg tracking-tight">
                                    Devskarnel
                                </h1>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.id === "chats"
                                    ? pathname.startsWith("/chats")
                                    : pathname === item.href ||
                                    (pathname === "/" &&
                                        item.id === "dashboard");

                            return (
                                <div key={item.id} className="relative group">
                                    {/* Tooltip - Desktop only when collapsed */}
                                    {!isExpanded && (
                                        <div className="hidden md:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                            {item.label}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                        </div>
                                    )}

                                    <Link
                                        href={item.href}
                                        className={`
                                        relative flex items-center px-2 py-3 rounded-lg transition-colors duration-200
                                        ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                                    `}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-900 rounded-r" />
                                        )}

                                        {/* Fixed-width Icon Container for perfect vertical alignment */}
                                        <div className="w-10 flex items-center justify-center shrink-0 md:mx-1">
                                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>

                                        <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-full ml-2' : 'opacity-0 w-0 ml-0'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="shrink-0 px-3 py-4 border-t border-gray-200 space-y-1">
                        {/* User Profile */}
                        <div className="relative group">
                            {!isExpanded && (
                                <div className="hidden md:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                    Profile
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                </div>
                            )}

                            <button title='profile' onClick={()=> {
                                router.push(`/profile/${user.name}`)
                            }} className="cursor-pointer w-full flex items-center px-2 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
                                <div className="w-10 flex items-center justify-center shrink-0 md:mx-1">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                                        <AiOutlineUser size={16} className="text-white" />
                                    </div>
                                </div>

                                <div className={`flex flex-col text-left overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-full ml-2' : 'opacity-0 w-0 ml-0'
                                    }`}>
                                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                                    <span className="text-xs text-gray-500">{user?.role}</span>
                                </div>
                            </button>
                        </div>

                        {user && <div className="relative group" onClick={handleLogout}>
                            {!isExpanded && (
                                <div className="hidden md:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                    Logout
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                </div>
                            )}

                            <button className="w-full flex items-center px-2 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200">
                                <div className="w-10 flex items-center justify-center shrink-0 md:mx-1">
                                    <IoIosLogOut size={22} />
                                </div>
                                <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-full ml-2' : 'opacity-0 w-0 ml-0'
                                    }`}>
                                    Logout
                                </span>
                            </button>
                        </div>}
                    </div>
                </aside>

                <div className={`hidden md:block transition-all duration-300 shrink-0 ${isHovered ? 'w-64' : 'w-20'}`} />

                {/* Mobile Content Spacer */}
                <div className="md:hidden h-16 shrink-0" />
            </div>
        </>
    );
};

export default Sidebar;