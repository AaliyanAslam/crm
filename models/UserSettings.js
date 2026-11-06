import sequelize from "@/config/sequelize";
import { DataTypes } from "sequelize";

const UserSettings = sequelize.define(
    "UserSettings",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(50),
            defaultValue: "+92 300 1234567",
        },
        designation: {
            type: DataTypes.STRING(100),
            defaultValue: "Lead Software Engineer",
        },
        department: {
            type: DataTypes.STRING(100),
            defaultValue: "Engineering",
        },
        bio: {
            type: DataTypes.TEXT,
        },
        timezone: {
            type: DataTypes.STRING(100),
            defaultValue: "Asia/Karachi (UTC+05:00)",
        },
        language: {
            type: DataTypes.STRING(50),
            defaultValue: "en",
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: "Available",
        },
        email_notifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        desktop_notifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        sound_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        auto_away_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 15,
        },
        theme_preference: {
            type: DataTypes.STRING(20),
            defaultValue: "system",
        },
    },
    {
        timestamps: true,
        tableName: "user_settings",
    }
);

export default UserSettings;

