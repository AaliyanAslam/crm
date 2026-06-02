import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/config/sequelize";

export async function GET() {
    try {
        await connectDB();
        const cookieStore = await cookies();
        const token = cookieStore.get("Token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "devskarnel_secret_key_123");
        const user = await User.findByPk(decoded.userId, {
            attributes: ['user_id', 'name', 'email', 'role', 'image']
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ success: false, user: null }, { status: 200 });
    }
}