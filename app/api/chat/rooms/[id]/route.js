

import { NextResponse } from "next/server";
import { ChatRoom } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const chatRoom = await ChatRoom.findOne({
            where: { room_id: id }
        });

        if (!chatRoom) {
            return NextResponse.json({
                success: false,
                message: "Chat Room not found or already deleted! 🙂"
            }, { status: 404 });
        }

        const deletedChatRoom = await ChatRoom.destroy({
            where: { room_id: id }
        });

        return NextResponse.json({
            success: true,
            message: "Chat room deleted successfully",
            deletedChatRoom
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Chat room not deleted or server error",
            error: error.message
        }, { status: 500 });
    }
}