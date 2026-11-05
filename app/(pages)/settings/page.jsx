"use client";

import React, { useState, useEffect } from "react";
import {
    Building2,
    GitBranch,
    Bell,
    ShieldCheck,
    Palette,
    Save,
    RotateCcw,
    Download,
    Check,
    Copy,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { inter } from "@/app/fonts";
import { useSettings } from "@/app/hooks/useSettings";

const DEFAULT_SETTINGS = {
    workspaceName: "Devskarnel CRM Agency",
    companyEmail: "admin@devskarnel.com",
    defaultCurrency: "USD",
    timezone: "Asia/Karachi",
    fiscalYearStart: "January",
    defaultLeadStage: "New",
    autoArchiveDeals: true,
    duplicateDetection: true,
    budgetAlertThreshold: 50000,
    autoAssignLead: false,
    desktopNotifications: true,
    weeklyDigestEmail: true,
    deadlineReminderTime: "3d",
    soundEffects: false,
    twoFactorAuth: false,
    sessionTimeout: "8h",
    apiWebhookKey: "dsk_live_99482bf108ec42a8b941097241",
    uiDensity: "compact",
    accentColor: "zinc",
};

const TABS = [
    { id: "general", label: "General & Workspace", icon: Building2 },
    { id: "pipeline", label: "Pipeline & Automations", icon: GitBranch },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "security", label: "Security & Access", icon: ShieldCheck },
    { id: "appearance", label: "Appearance & Layout", icon: Palette },
];

export default function SettingsPage() {
    const { settings: dbSettings, updateSettings, isLoading } = useSettings();
    const [activeTab, setActiveTab] = useState("general");
    const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);
    const [copiedKey, setCopiedKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync from database / SWR when loaded
    useEffect(() => {
        if (dbSettings) {
            setTimeout(() => {
                setLocalSettings(dbSettings);
            }, 0);
        }
    }, [dbSettings]);

    const updateField = (field, value) => {
        setLocalSettings((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateSettings(localSettings);
            if (res.success) {
                toast.success("Settings saved successfully to database!");
            } else {
                toast.error(res.message || "Failed to save settings.");
            }
        } catch {
            toast.error("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        const ok = confirm("Are you sure you want to restore default settings?");
        if (!ok) return;

        setLocalSettings(DEFAULT_SETTINGS);
        await updateSettings(DEFAULT_SETTINGS);
        toast.success("Settings reset to defaults.");
    };

    const handleExportConfig = () => {
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(localSettings, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute(
            "download",
            `crm_settings_backup_${new Date().toISOString().split("T")[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("Settings exported as JSON.");
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(localSettings.apiWebhookKey);
        setCopiedKey(true);
        toast.success("API key copied to clipboard.");
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleRegenerateKey = () => {
        const ok = confirm("Regenerate API webhook key? Existing webhooks may need updating.");
        if (!ok) return;

        const newKey =
            "dsk_live_" +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        updateField("apiWebhookKey", newKey);
        toast.success("New API key generated.");
    };

    return (
        <div
            suppressHydrationWarning
            className={`min-h-screen bg-zinc-50/70 pb-16 text-zinc-900 ${inter.className}`}
        >
            <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-5">
                
                {/* Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
                            <span>{localSettings.workspaceName || "Devskarnel CRM"}</span>
                            <span className="text-zinc-300">/</span>
                            <span>Workspace</span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-800 font-semibold">Settings</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                            Workspace Settings
                        </h1>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Configure your agency preferences, CRM automations, and security controls.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:self-auto self-start">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-xs hover:bg-zinc-50 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Reset</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </div>
                </div>

                {/* Main Settings Layout (Sidebar Navigation + Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    
                    {/* Tabs Navigation */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-1">
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-1.5 shadow-xs">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                                            isActive
                                                ? "bg-zinc-900 text-white shadow-xs"
                                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Backup & Export Quick Action */}
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs space-y-2 text-xs">
                            <span className="font-semibold text-zinc-800 block text-xs">
                                Backup Configuration
                            </span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                                Export your workspace configuration and automation settings as a JSON file.
                            </p>
                            <button
                                type="button"
                                onClick={handleExportConfig}
                                className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Export Settings (.JSON)</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-4">
                        
                        {/* ─── TAB 1: GENERAL & WORKSPACE ─── */}
                        {activeTab === "general" && (
                            <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden divide-y divide-zinc-100">
                                <div className="p-4 sm:p-5">
                                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        General Workspace Details
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Basic profile and locale preferences for your CRM agency.
                                    </p>
                                </div>

                                {/* Setting 1: Workspace Name */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            1. Workspace Organization Name
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            The legal or agency brand name displayed in report exports and client emails.
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={localSettings.workspaceName}
                                        onChange={(e) => updateField("workspaceName", e.target.value)}
                                        className="w-full sm:w-64 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                    />
                                </div>

                                {/* Setting 2: Company Email */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            2. Administrative Contact Email
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Primary address for system notifications, password resets, and critical alerts.
                                        </p>
                                    </div>
                                    <input
                                        type="email"
                                        value={localSettings.companyEmail}
                                        onChange={(e) => updateField("companyEmail", e.target.value)}
                                        className="w-full sm:w-64 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                    />
                                </div>

                                {/* Setting 3: Default Currency */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            3. Base Currency
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Default currency code applied to project budgets and revenue metrics across the CRM.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.defaultCurrency}
                                        onChange={(e) => updateField("defaultCurrency", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="USD">USD ($) · United States Dollar</option>
                                        <option value="EUR">EUR (€) · Euro</option>
                                        <option value="GBP">GBP (£) · British Pound</option>
                                        <option value="PKR">PKR (₨) · Pakistani Rupee</option>
                                        <option value="AED">AED (د.إ) · UAE Dirham</option>
                                    </select>
                                </div>

                                {/* Setting 4: Timezone */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            4. Workspace Timezone
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Aligns timestamps in activity timelines and project delivery schedules.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.timezone}
                                        onChange={(e) => updateField("timezone", e.target.value)}
                                        className="w-full sm:w-56 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="Asia/Karachi">Asia/Karachi (GMT+5:00)</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                                        <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                                        <option value="UTC">UTC (Universal Coordinated Time)</option>
                                    </select>
                                </div>

                                {/* Setting 5: Fiscal Year */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            5. Fiscal Year Starting Month
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Determines quarterly revenue calculations and tax accounting intervals.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.fiscalYearStart}
                                        onChange={(e) => updateField("fiscalYearStart", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="January">January</option>
                                        <option value="April">April (UK standard)</option>
                                        <option value="July">July (US/Federal standard)</option>
                                        <option value="October">October</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 2: PIPELINE & AUTOMATIONS ─── */}
                        {activeTab === "pipeline" && (
                            <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden divide-y divide-zinc-100">
                                <div className="p-4 sm:p-5">
                                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Pipeline & CRM Automations
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Rules for incoming leads, duplicate prevention, and stage workflows.
                                    </p>
                                </div>

                                {/* Setting 6: Default Lead Stage */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            6. Default Lead Intake Stage
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            The initial pipeline status automatically assigned when a client submits an inquiry.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.defaultLeadStage}
                                        onChange={(e) => updateField("defaultLeadStage", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="New">New (Uncontacted)</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                    </select>
                                </div>

                                {/* Setting 7: Auto-Archive Closed Deals */}
                                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            7. Auto-Archive Closed Accounts
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Automatically move client records to archived status 90 days after project completion.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={localSettings.autoArchiveDeals}
                                        onChange={(val) => updateField("autoArchiveDeals", val)}
                                    />
                                </div>

                                {/* Setting 8: Duplicate Detection */}
                                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            8. Client Duplicate Prevention
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Warn or block registration if email address or phone number matches an existing client.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={localSettings.duplicateDetection}
                                        onChange={(val) => updateField("duplicateDetection", val)}
                                    />
                                </div>

                                {/* Setting 9: Budget Alert Threshold */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            9. High-Value Budget Alert Threshold
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Trigger an automated manager review tag when a project budget meets or exceeds this amount.
                                        </p>
                                    </div>
                                    <div className="relative w-full sm:w-48">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={localSettings.budgetAlertThreshold}
                                            onChange={(e) =>
                                                updateField("budgetAlertThreshold", Number(e.target.value))
                                            }
                                            className="w-full rounded-lg border border-zinc-200 pl-7 pr-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 3: NOTIFICATIONS & ALERTS ─── */}
                        {activeTab === "notifications" && (
                            <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden divide-y divide-zinc-100">
                                <div className="p-4 sm:p-5">
                                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Notification Rules & Preferences
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Control push notifications, weekly digests, and deadline pings.
                                    </p>
                                </div>

                                {/* Setting 10: In-App Desktop Notifications */}
                                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            10. Real-time In-App & Push Notifications
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Show instant desktop alerts when a team member messages or assigns a board card.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={localSettings.desktopNotifications}
                                        onChange={(val) => updateField("desktopNotifications", val)}
                                    />
                                </div>

                                {/* Setting 11: Weekly Email Digest */}
                                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            11. Weekly Executive Performance Digest
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Receive a Monday morning briefing summarizing new leads, deals closed, and active project health.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={localSettings.weeklyDigestEmail}
                                        onChange={(val) => updateField("weeklyDigestEmail", val)}
                                    />
                                </div>

                                {/* Setting 12: Project Deadline Reminder */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            12. Project Deadline Early-Warning Interval
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            How far in advance of an approaching sprint delivery deadline the team should be alerted.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.deadlineReminderTime}
                                        onChange={(e) => updateField("deadlineReminderTime", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="24h">24 Hours Before</option>
                                        <option value="3d">3 Days Before</option>
                                        <option value="7d">1 Week Before</option>
                                    </select>
                                </div>

                                {/* Setting 13: Sound Effects */}
                                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            13. Audio Cues & Chimes
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Play a subtle chime upon receiving live chat messages or task status updates.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={localSettings.soundEffects}
                                        onChange={(val) => updateField("soundEffects", val)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 4: SECURITY & ACCESS ─── */}
                        {activeTab === "security" && (
                            <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden divide-y divide-zinc-100">
                                <div className="p-4 sm:p-5">
                                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Security & Access Control
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Manage multi-factor authentication, session expiration, and API webhook secrets.
                                    </p>
                                </div>

                                {/* Setting 14: Two-Factor Authentication */}
                                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            14. Two-Factor Authentication (2FA)
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Enforce authenticator app (TOTP) verification for all logins and sensitive actions.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={localSettings.twoFactorAuth}
                                        onChange={(val) => updateField("twoFactorAuth", val)}
                                    />
                                </div>

                                {/* Setting 15: Session Timeout */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            15. Inactive Session Expiration
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Automatically revoke tokens and sign out users after a duration of inactivity.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.sessionTimeout}
                                        onChange={(e) => updateField("sessionTimeout", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="15m">15 Minutes</option>
                                        <option value="1h">1 Hour</option>
                                        <option value="8h">8 Hours (Work shift)</option>
                                        <option value="7d">7 Days</option>
                                    </select>
                                </div>

                                {/* Setting 16: API Webhook Secret */}
                                <div className="p-4 sm:p-5 space-y-2">
                                    <div className="space-y-0.5">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            16. Developer API & Webhook Secret
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Authenticate incoming webhooks from payment gateways and external CRM integrations.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 max-w-lg">
                                        <input
                                            readOnly
                                            type="text"
                                            value={localSettings.apiWebhookKey}
                                            className="font-mono text-[11px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-700 w-full outline-none select-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCopyKey}
                                            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0"
                                        >
                                            {copiedKey ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                            <span>{copiedKey ? "Copied" : "Copy"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRegenerateKey}
                                            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            <span>Rotate</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 5: APPEARANCE & DISPLAY ─── */}
                        {activeTab === "appearance" && (
                            <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden divide-y divide-zinc-100">
                                <div className="p-4 sm:p-5">
                                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                                        Appearance & Display Preferences
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Customize layout density, theme accents, and UI presentation.
                                    </p>
                                </div>

                                {/* Setting 17: Interface Density */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            17. Interface Display Density
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Compact mode increases information density for data tables and task cards (Google Cloud / Shadcn style).
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.uiDensity}
                                        onChange={(e) => updateField("uiDensity", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="compact">Compact (High Density)</option>
                                        <option value="comfortable">Comfortable (Spacious)</option>
                                    </select>
                                </div>

                                {/* Setting 18: Primary Accent Tone */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5 max-w-md">
                                        <label className="text-xs font-semibold text-zinc-900">
                                            18. Workspace Accent Theme
                                        </label>
                                        <p className="text-[11px] text-zinc-500">
                                            Primary tone applied to highlights, active tabs, and primary action buttons.
                                        </p>
                                    </div>
                                    <select
                                        value={localSettings.accentColor}
                                        onChange={(e) => updateField("accentColor", e.target.value)}
                                        className="w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 cursor-pointer"
                                    >
                                        <option value="zinc">Monochrome Zinc (Default)</option>
                                        <option value="blue">Royal Blue (Enterprise)</option>
                                        <option value="emerald">Emerald Forest (Growth)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

function Switch({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`cursor-pointer relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 ${
                checked ? "bg-zinc-900" : "bg-zinc-200"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                    checked ? "translate-x-4.5" : "translate-x-0.5"
                }`}
            />
        </button>
    );
}
