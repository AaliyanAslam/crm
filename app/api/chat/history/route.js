import { NextResponse } from "next/server";
import { Message, User } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const room_id = searchParams.get("room_id");

        const history = await Message.findAll({
            where: { room_id },
            include: [{ model: User, as: 'sender', attributes: ['name' , 'image'] }],
            order: [['createdAt', 'ASC']]
        });

        return NextResponse.json({ success: true, history });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}