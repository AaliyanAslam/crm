/**
 * @swagger
 * /api/cards/{id}/descriptions:
 *   post:
 *     summary: Create a description for a card
 *     tags: [Descriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Description created successfully
 *       400:
 *         description: Invalid request payload
 *       404:
 *         description: Parent card not found
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get descriptions for a card
 *     tags: [Descriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Descriptions retrieved successfully
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import Description from "@/models/Description";
import { Card } from "@/models";

export async function POST(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const numericCardId = parseInt(id);

        const { text } = await req.json();

        if (!text?.trim()) {
            return NextResponse.json({
                success: false,
                message: "Description text is required",
            }, { status: 400 });
        }

        const card = await Card.findByPk(numericCardId);
        if (!card) {
            return NextResponse.json({
                success: false,
                message: "Card nahi mila",
            }, { status: 404 });
        }

        const newDescription = await Description.create({
            text,
            card_id: numericCardId
        });

        return NextResponse.json({
            success: true,
            message: "Description created successfully! ✨",
            createdDescription: newDescription
        }, { status: 201 });

    } catch (error) {
        console.error("Description API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
    }
}




export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const card = await Card.findByPk(id);
        if (!card) {
            return NextResponse.json({
                success: false,
                message: "card not found"
            }, { status: 404 })
        }
        const descriptions = await Description.findAll({
            where: { card_id: id },
            order: [["createdAt", "DESC"]]
        })

        return NextResponse.json({
            success: true,
            message: "all descriptions :",
            descriptions
        })



    } catch (error) {
        return NextResponse.json({
            success: true,
            message: "error fetching description",
            error: error.message

        }, { status: 500 })
    }
}