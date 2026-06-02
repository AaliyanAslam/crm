import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { Message } from "@/models";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { text } = await req.json();

        if (!text || !text.trim()) {
            return NextResponse.json({
                success: false,
                message: "Message text cannot be empty"
            }, { status: 400 });
        }

        const message = await Message.findByPk(id);

        if (!message) {
            return NextResponse.json({
                success: false,
                message: "Message not found"
            }, { status: 404 });
        }

        // Update the message
        message.text = text.trim();
        message.isEdited = true;
        await message.save();

        return NextResponse.json({
            success: true,
            message: "Message updated successfully",
            updatedMessage: message
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to update message",
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {

        await connectDB();
        const { id } = await params;
        const message = await Message.findByPk(id);

        if (!message) return NextResponse.json({
            success: false,
            message: "message not found or deleted already!"
        }, { status: 404 })

        const deleteMessage = await message.destroy();

        return NextResponse.json({
            success: true,
            message: "messsge is here",
            deletedMessage: deleteMessage
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "message not deleted, or server error!",
            error: error.message
        }, { status: 500 })
    }

}