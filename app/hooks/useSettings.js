"use client";

import useSWR from "swr";
import { useCallback } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const DEFAULT_SETTINGS = {
    workspaceName: "CRM",
    companyEmail: "admin@crm.com",
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

export function useSettings() {
    const { data, mutate, isLoading } = useSWR("/api/settings", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fallbackData: { settings: DEFAULT_SETTINGS },
    });

    const settings = data?.settings || DEFAULT_SETTINGS;

    const formatCurrency = useCallback(
        (amount) => {
            const num = Number(amount) || 0;
            const currency = settings.defaultCurrency || "USD";

            switch (currency) {
                case "EUR":
                    return `€${num.toLocaleString()}`;
                case "GBP":
                    return `£${num.toLocaleString()}`;
                case "PKR":
                    return `₨ ${num.toLocaleString()}`;
                case "AED":
                    return `AED ${num.toLocaleString()}`;
                case "USD":
                default:
                    return `$${num.toLocaleString()}`;
            }
        },
        [settings.defaultCurrency]
    );

    const updateSettings = useCallback(
        async (newSettings) => {
            try {
                const res = await fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newSettings),
                });
                const resData = await res.json();
                if (resData.success) {
                    await mutate({ settings: resData.settings }, false);
                    if (typeof window !== "undefined") {
                        localStorage.setItem(
                            "crm_workspace_settings",
                            JSON.stringify(resData.settings)
                        );
                    }
                    return { success: true };
                }
                return { success: false, message: resData.message };
            } catch (err) {
                return { success: false, message: err.message };
            }
        },
        [mutate]
    );

    return {
        settings,
        formatCurrency,
        updateSettings,
        isLoading,
        mutate,
    };
}

