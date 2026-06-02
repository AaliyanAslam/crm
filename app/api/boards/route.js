/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               bg_color:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all boards
 *     tags: [Boards]
 *     responses:
 *       200:
 *         description: Boards retrieved successfully
 *       500:
 *         description: Server error
 */

// ... your existing imports and code ...
import Board from "@/models/Board";
import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";


export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, bg_color, description } = body;
        if (!name) {
            return NextResponse.json({ Message: "name is required" }, { status: 400 })
        }

        const newBoard = await Board.create({
            name,
            bg_color: bg_color || "#57C9D8",
            description
        });

        return NextResponse.json({
            success: true,
            message: "Board created successfully",
            board: newBoard
        }, { status: 201 });

    } catch (error) {
        console.error("Post board error", error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        })
    }
}


export async function GET() {
    try {
        await connectDB();
        const allBoards = await Board.findAll({
            order: [["created_at", "DESC"]]
        });

        return NextResponse.json({
            success: true,
            message: 'All boards are below',
            count: allBoards.length,
            boards: allBoards
        }, { status: 200 })

    } catch (error) {
        console.error(error);
        return NextResponse.json({

            success: false,
            message: "Error getting boards or server error",
        }, {
            status: 500
        })
    }
}
