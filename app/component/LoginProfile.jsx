"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";
import {
    User as UserIcon,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Clock,
    Globe,
    Bell,
    Volume2,
    Shield,
    KeyRound,
    Check,
    Loader2,
    Sparkles,
    Camera,
    Save,
    Circle,
    Sliders,
} from "lucide-react";
import { inter } from "../fonts";
import { toast } from "sonner";
import Image from "next/image";

const PRESET_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
];

const STATUS_OPTIONS = [
    { value: "Available", label: "Available", color: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { value: "In a Meeting", label: "In a Meeting", color: "bg-purple-500", text: "text-purple-700 bg-purple-50 border-purple-200" },
    { value: "Away", label: "Away", color: "bg-amber-500", text: "text-amber-700 bg-amber-50 border-amber-200" },
    { value: "Do Not Disturb", label: "Do Not Disturb", color: "bg-rose-500", text: "text-rose-700 bg-rose-50 border-rose-200" },
];

const LoginProfile = () => {
    const { user, loading, mutate } = useUser();
    const [activeTab, setActiveTab] = useState("general"); // 'general' | 'work' | 'preferences' | 'notifications' | 'security'
    const [isSaving, setIsSaving] = useState(false);

    // Form States (16 settings)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [phone, setPhone] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("Engineering");
    const [bio, setBio] = useState("");
    const [timezone, setTimezone] = useState("Asia/Karachi (UTC+05:00)");
    const [language, setLanguage] = useState("en");
    const [status, setStatus] = useState("Available");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [desktopNotifications, setDesktopNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoAwayMinutes, setAutoAwayMinutes] = useState(15);
    const [themePreference, setThemePreference] = useState("system");

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Populate initial values from user & user.settings
    useEffect(() => {
        if (!user) return;
        const timer = setTimeout(() => {
            setName(user.name || "");
            setEmail(user.email || "");
            setImageUrl(user.image || "");

            const s = user.settings;
            if (s) {
                setPhone(s.phone || "+92 300 1234567");
                setDesignation(s.designation || "Lead Software Engineer");
                setDepartment(s.department || "Engineering");
                setBio(s.bio || "Full-stack developer at Devskarnel CRM. Passionate about performant Next.js applications and cloud architecture.");
                setTimezone(s.timezone || "Asia/Karachi (UTC+05:00)");
                setLanguage(s.language || "en");
                setStatus(s.status || "Available");
                setEmailNotifications(s.email_notifications !== undefined ? Boolean(s.email_notifications) : true);
                setDesktopNotifications(s.desktop_notifications !== undefined ? Boolean(s.desktop_notifications) : true);
                setSoundEnabled(s.sound_enabled !== undefined ? Boolean(s.sound_enabled) : true);
                setAutoAwayMinutes(s.auto_away_minutes || 15);
                setThemePreference(s.theme_preference || "system");
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [user]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!user?.user_id) return;

        // Validation
        if (!name.trim()) {
            toast.error("Full Name cannot be empty");
            return;
        }

        // If password is being updated, check confirmation
        if (newPassword) {
            if (!currentPassword) {
                toast.error("Please enter your current password to set a new password");
                return;
            }
            if (newPassword.length < 6) {
                toast.error("New password must be at least 6 characters long");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error("New password and confirm password do not match");
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                image: imageUrl.trim(),
                phone: phone.trim(),
                designation: designation.trim(),
                department,
                bio: bio.trim(),
                timezone,
                language,
                status,
                email_notifications: emailNotifications,
                desktop_notifications: desktopNotifications,
                sound_enabled: soundEnabled,
                auto_away_minutes: Number(autoAwayMinutes),
                theme_preference: themePreference,
            };

            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const res = await fetch(`/api/user/${user.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to update profile settings");
            }

            toast.success("Profile and settings saved successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            await mutate();
        } catch (err) {
            toast.error(err.message || "An error occurred while saving profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-[70vh] bg-zinc-50/70 flex items-center justify-center p-6 ${inter.className}`}>
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
                    <span className="text-xs font-medium text-zinc-500">Loading profile…</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-[70vh] bg-zinc-50/70 flex items-center justify-center p-6 ${inter.className}`}>
                <div className="text-center max-w-sm">
                    <p className="text-sm font-semibold text-zinc-800">No profile session found</p>
                    <p className="text-xs text-zinc-500 mt-1">Please sign in to view and edit your account settings.</p>
                </div>
            </div>
        );
    }

    const currentStatusConfig = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

    return (
        <div className={`min-h-screen bg-zinc-50/70 py-6 sm:py-8 text-zinc-900 ${inter.className}`}>
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                            <span>Account</span>
                            <span>/</span>
                            <span className="text-zinc-900 font-semibold">User Profile & Settings</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                            Account Profile
                        </h1>
                        <p className="mt-1 text-xs text-zinc-500">
                            Manage your personal credentials, contact info, workspace preferences, and security settings.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-50 self-start sm:self-auto"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Saving…" : "Save Changes"}
                    </button>
                </div>

                {/* Profile Overview Card */}
                <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-700 shadow-xs">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={name || "Profile"}
                                            width={64}
                                            height={64}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span>{(name || "U").slice(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <span
                                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white ${currentStatusConfig.color}`}
                                    title={`Status: ${status}`}
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                                        {name || "Team Member"}
                                    </h2>
                                    <span className="rounded-md bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">
                                        {user?.role || "Member"}
                                    </span>
                                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${currentStatusConfig.text}`}>
                                        {status}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">{email || user?.email}</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    {designation} · {department}
                                </p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right text-xs text-zinc-500">
                            <span className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400">Account ID</span>
                            <span className="font-mono text-zinc-700 font-semibold">#{user?.user_id}</span>
                        </div>
                    </div>
                </div>

                {/* Settings Navigation Tabs */}
                <div className="mt-6 flex overflow-x-auto border-b border-zinc-200/80 [scrollbar-width:none]">
                    {[
                        { id: "general", label: "Personal Info", icon: UserIcon },
                        { id: "work", label: "Work & Team", icon: Briefcase },
                        { id: "preferences", label: "Preferences", icon: Globe },
                        { id: "notifications", label: "Notifications & Sound", icon: Bell },
                        { id: "security", label: "Security & Password", icon: Shield },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                                    isActive
                                        ? "border-zinc-900 text-zinc-900"
                                        : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Form Panels */}
                <form onSubmit={handleSave} className="mt-6">
                    {/* TAB 1: Personal Info */}
                    {activeTab === "general" && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Personal Details</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Manage your identity, contact email, and profile photo.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Setting 1: Full Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Setting 2: Email Address */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Setting 3: Phone Number */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Phone / Mobile Contact
                                    </label>
                                    <div className="relative">
                                        <Phone className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+92 300 1234567"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                </div>

                                {/* Setting 4: Profile Picture URL */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Avatar Image URL
                                    </label>
                                    <div className="relative">
                                        <Camera className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://example.com/avatar.jpg"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preset Avatars Picker */}
                            <div className="border-t border-zinc-100 pt-4">
                                <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                                    Or Choose A Curated Avatar Preset
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    {PRESET_AVATARS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setImageUrl(p)}
                                            className={`relative h-12 w-12 rounded-xl overflow-hidden border transition-all ${
                                                imageUrl === p
                                                    ? "ring-2 ring-zinc-900 ring-offset-2 scale-105 border-zinc-900"
                                                    : "border-zinc-200 hover:scale-105 opacity-80 hover:opacity-100"
                                            }`}
                                        >
                                            <Image
                                                src={p}
                                                alt={`Preset ${idx + 1}`}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                    {imageUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl("")}
                                            className="text-xs text-rose-600 hover:underline px-2 py-1"
                                        >
                                            Clear Photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Work & Team */}
                    {activeTab === "work" && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Work & Team Role</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Define your designation, functional team, and team bio.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Setting 5: Designation */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Job Title / Designation
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            placeholder="e.g. Senior Full-Stack Engineer, Product Lead"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                </div>

                                {/* Setting 6: Department */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Department / Team
                                    </label>
                                    <div className="relative">
                                        <Building2 className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-8 text-xs sm:text-sm text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                                        >
                                            <option value="Engineering">Engineering & Development</option>
                                            <option value="Product">Product Management</option>
                                            <option value="Design">UI/UX & Product Design</option>
                                            <option value="Sales">Sales & Business Development</option>
                                            <option value="Customer Success">Customer Success & Support</option>
                                            <option value="Operations">Operations & Human Resources</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Setting 7: Bio */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                    About / Bio
                                </label>
                                <textarea
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write a brief intro about your skills, current sprint focus, or technical background..."
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                                />
                                <p className="mt-1 text-[11px] text-zinc-400">
                                    Visible on your profile card and when teammates mention @{name || "you"} in chat.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Preferences */}
                    {activeTab === "preferences" && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Regional & Presence Preferences</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Configure your active availability status, primary timezone, and interface language.</p>
                            </div>

                            {/* Setting 8: Availability Status */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                                    Current Presence Status
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setStatus(opt.value)}
                                            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                                                status === opt.value
                                                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                                                    : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:bg-zinc-100"
                                            }`}
                                        >
                                            <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                                            <span className="truncate">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 border-t border-zinc-100 pt-5">
                                {/* Setting 9: Timezone */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Timezone
                                    </label>
                                    <div className="relative">
                                        <Clock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <select
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-8 text-xs sm:text-sm text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                                        >
                                            <option value="Asia/Karachi (UTC+05:00)">Asia/Karachi (UTC+05:00)</option>
                                            <option value="Europe/London (UTC+00:00)">Europe/London (UTC+00:00)</option>
                                            <option value="America/New_York (UTC-05:00)">America/New_York (UTC-05:00)</option>
                                            <option value="America/Los_Angeles (UTC-08:00)">America/Los_Angeles (UTC-08:00)</option>
                                            <option value="Asia/Dubai (UTC+04:00)">Asia/Dubai (UTC+04:00)</option>
                                            <option value="Asia/Singapore (UTC+08:00)">Asia/Singapore (UTC+08:00)</option>
                                            <option value="Asia/Tokyo (UTC+09:00)">Asia/Tokyo (UTC+09:00)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Setting 10: Language */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Preferred Language
                                    </label>
                                    <div className="relative">
                                        <Globe className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-8 text-xs sm:text-sm text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="en-gb">English (UK)</option>
                                            <option value="ur">Urdu (اردو)</option>
                                            <option value="es">Spanish (Español)</option>
                                            <option value="de">German (Deutsch)</option>
                                            <option value="fr">French (Français)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Notifications & Sounds */}
                    {activeTab === "notifications" && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Notifications & Sound Preferences</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Control how and when you receive task updates and chat alerts.</p>
                            </div>

                            <div className="space-y-4 divide-y divide-zinc-100">
                                {/* Setting 11: Email Notifications */}
                                <div className="flex items-center justify-between pt-3 first:pt-0">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-900">Email Notifications</p>
                                        <p className="text-[11px] text-zinc-500">Receive periodic emails for task assignments, SLA milestones, and mentions.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            emailNotifications ? "bg-zinc-900" : "bg-zinc-200"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                emailNotifications ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Setting 12: Desktop Push Alerts */}
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-900">Desktop Push Notifications</p>
                                        <p className="text-[11px] text-zinc-500">Show native browser popups when you receive chat messages while inactive.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDesktopNotifications(!desktopNotifications)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            desktopNotifications ? "bg-zinc-900" : "bg-zinc-200"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                desktopNotifications ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Setting 13: Sound Chimes */}
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-900">Sound & Audio Alerts</p>
                                        <p className="text-[11px] text-zinc-500">Play subtle audio chimes on task state transitions and channel pings.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            soundEnabled ? "bg-zinc-900" : "bg-zinc-200"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                soundEnabled ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Setting 14: Auto-away Idle Timer */}
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-900">Auto-Away Inactivity Timer</p>
                                        <p className="text-[11px] text-zinc-500">Automatically switch presence status to Away after period of inactivity.</p>
                                    </div>
                                    <select
                                        value={autoAwayMinutes}
                                        onChange={(e) => setAutoAwayMinutes(Number(e.target.value))}
                                        className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none cursor-pointer"
                                    >
                                        <option value="5">After 5 mins</option>
                                        <option value="15">After 15 mins</option>
                                        <option value="30">After 30 mins</option>
                                        <option value="60">After 1 hour</option>
                                        <option value="0">Never</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: Security */}
                    {activeTab === "security" && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Security & Credentials</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Keep your account secure by rotating your password regularly.</p>
                            </div>

                            {/* Setting 15: Change Password Fields */}
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-type new password"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9.5 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Leave password fields blank if you only wish to update personal or preference settings.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Bottom Save Action Bar */}
                    <div className="mt-6 flex items-center justify-between border-t border-zinc-200/80 pt-5">
                        <span className="text-xs text-zinc-500">
                            Updates are saved persistently to your workspace profile.
                        </span>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSaving ? "Saving Settings…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginProfile;
