import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { User } from "@/models";


export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();
        const { name, image } = data;
        const user = await User.findByPk(id);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "user not found!"
            }, { status: 404 })
        }
        const updatedUser = await user.update({
            name: name || user.name,
            image: image || user.image
        })
        return NextResponse.json({
            success: true,
            message: "user updated success",
            updatedUser
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success: "false",
            message: "user not updated pr server error",
            error: error.message
        }, { status: 500 })
    }

}