import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
export async function POST(req) {

    try {
        await connectDB();
        const { email, password } = await req.json();
        const user = await User.findOne({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Wrong email or password!"
            }, { status: 401 })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({
                success: false,
                message: "Wrong email or password!"
            }, { status: 401 })
        }
        const token = jwt.sign({
            userId: user.user_id,
            role: user.role
        }, JWT_SECRET, {
            expiresIn: "7d"
        })

        const response = NextResponse.json({
            success: true,
            message: `Hello ${user.name}! Welcome back😊`,
            user: {
                id: user.user_id,
                name: user.name,
                role: user.role,
                image: user.image
            }
        });

        response.cookies.set("Token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        })


        return response

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({
            success: false,
            message: "Server mein koi masla hua hai"
        }, { status: 500 });
    }


}