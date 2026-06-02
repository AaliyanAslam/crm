/**
 * @swagger
 * /api/chat/rooms:
 *   post:
 *     summary: Create a new chat room
 *     tags: [ChatRooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: General Discussion
 *               user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Chat room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chat room created!
 *                 createdChatRoom:
 *                   type: object
 *       500:
 *         description: Chat room not created or server error
 */


import { NextResponse } from "next/server";
import { ChatRoom, User } from "@/models";
import { connectDB } from "@/config/sequelize";


export async function POST(req) {
    try {
        await connectDB();
        const { name, user_id } = await req.json();
        const createdChatRoom = await ChatRoom.create({
            name,
            created_by: user_id
        })

        return NextResponse.json({
            success: true,
            message: "Chat room created!",
            createdChatRoom
        }, {
            status: 201
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Chat room not created or server error"
        }, {
            status: 500
        })
    }

}


export async function GET() {
    await connectDB();
    try {
        const rooms = await ChatRoom.findAll({
            include: [{ model: User, as: 'creator', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        return NextResponse.json({ success: true, rooms });
    } catch (error) {
        return NextResponse.json({ success: false , error : error.message });

    }
}