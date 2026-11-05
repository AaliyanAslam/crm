export const runtime = "nodejs";

import { NextResponse } from "next/server";
import sequelize from "@/config/sequelize";
import { QueryTypes } from "sequelize";

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

export async function GET() {
    try {
        await sequelize.authenticate();

        // Ensure table exists
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS workspace_settings (
                id INT PRIMARY KEY,
                settings_json TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const rows = await sequelize.query(
            "SELECT settings_json FROM workspace_settings WHERE id = 1",
            { type: QueryTypes.SELECT }
        );

        if (rows.length === 0) {
            await sequelize.query(
                "INSERT INTO workspace_settings (id, settings_json) VALUES (1, :json)",
                {
                    replacements: { json: JSON.stringify(DEFAULT_SETTINGS) },
                    type: QueryTypes.INSERT,
                }
            );
            return NextResponse.json({ settings: DEFAULT_SETTINGS });
        }

        const parsed = JSON.parse(rows[0].settings_json);
        return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
    } catch (error) {
        return NextResponse.json(
            { settings: DEFAULT_SETTINGS, error: error.message },
            { status: 200 }
        );
    }
}

export async function PUT(req) {
    try {
        await sequelize.authenticate();
        const body = await req.json();
        const merged = { ...DEFAULT_SETTINGS, ...body };

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS workspace_settings (
                id INT PRIMARY KEY,
                settings_json TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await sequelize.query(
            "INSERT INTO workspace_settings (id, settings_json) VALUES (1, :json) ON DUPLICATE KEY UPDATE settings_json = :json",
            {
                replacements: { json: JSON.stringify(merged) },
                type: QueryTypes.RAW,
            }
        );

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            settings: merged,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

