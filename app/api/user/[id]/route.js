import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { User, UserSettings } from "@/models";
import bcrypt from "bcrypt";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        let user;
        if (!isNaN(id)) {
            user = await User.findByPk(id, {
                attributes: ["user_id", "name", "email", "role", "image", "createdAt"],
                include: [{ model: UserSettings, as: "settings" }],
            });
        } else {
            user = await User.findOne({
                where: { name: id },
                attributes: ["user_id", "name", "email", "role", "image", "createdAt"],
                include: [{ model: UserSettings, as: "settings" }],
            });
        }

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error("GET user error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();

        let user;
        if (!isNaN(id)) {
            user = await User.findByPk(id);
        } else {
            user = await User.findOne({ where: { name: id } });
        }

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Handle Password Change if requested
        if (data.newPassword) {
            if (!data.currentPassword) {
                return NextResponse.json(
                    { success: false, message: "Current password is required to change password" },
                    { status: 400 }
                );
            }

            const isMatch = await bcrypt.compare(data.currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json(
                    { success: false, message: "Incorrect current password" },
                    { status: 400 }
                );
            }

            if (data.newPassword.length < 6) {
                return NextResponse.json(
                    { success: false, message: "New password must be at least 6 characters" },
                    { status: 400 }
                );
            }

            const hashed = await bcrypt.hash(data.newPassword, 10);
            user.password = hashed;
        }

        // Update User primary attributes
        if (data.name) user.name = data.name.trim();
        if (data.email) user.email = data.email.trim();
        if (data.image !== undefined) user.image = data.image;

        await user.save();

        // Update or create UserSettings
        let userSettings = await UserSettings.findOne({
            where: { user_id: user.user_id },
        });

        const settingsPayload = {
            phone: data.phone !== undefined ? data.phone : userSettings?.phone,
            designation: data.designation !== undefined ? data.designation : userSettings?.designation,
            department: data.department !== undefined ? data.department : userSettings?.department,
            bio: data.bio !== undefined ? data.bio : userSettings?.bio,
            timezone: data.timezone !== undefined ? data.timezone : userSettings?.timezone,
            language: data.language !== undefined ? data.language : userSettings?.language,
            status: data.status !== undefined ? data.status : userSettings?.status,
            email_notifications: data.email_notifications !== undefined ? Boolean(data.email_notifications) : userSettings?.email_notifications,
            desktop_notifications: data.desktop_notifications !== undefined ? Boolean(data.desktop_notifications) : userSettings?.desktop_notifications,
            sound_enabled: data.sound_enabled !== undefined ? Boolean(data.sound_enabled) : userSettings?.sound_enabled,
            auto_away_minutes: data.auto_away_minutes !== undefined ? Number(data.auto_away_minutes) : userSettings?.auto_away_minutes,
            theme_preference: data.theme_preference !== undefined ? data.theme_preference : userSettings?.theme_preference,
        };

        if (userSettings) {
            await userSettings.update(settingsPayload);
        } else {
            userSettings = await UserSettings.create({
                user_id: user.user_id,
                ...settingsPayload,
            });
        }

        const reloaded = await User.findByPk(user.user_id, {
            attributes: ["user_id", "name", "email", "role", "image", "createdAt"],
            include: [{ model: UserSettings, as: "settings" }],
        });

        return NextResponse.json(
            {
                success: true,
                message: "Profile and settings updated successfully",
                user: reloaded,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT user error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
