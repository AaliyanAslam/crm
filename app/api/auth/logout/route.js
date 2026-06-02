import { NextResponse } from "next/server";

export async function POST() {
    try {
        // 1. Response create karein
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully! Phir milenge. 👋"
        });

        // 2. Cookie ko clear karein
        // Token ki value khali kar dein aur maxAge 0 kar dein taake woh foran delete ho jaye
        response.cookies.set("Token", "", {
            httpOnly: true,
            expires: new Date(0), // Past date yani expired
            path: "/",
        });

        return response;

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Logout mein masla hua"
        }, { status: 500 });
    }
}