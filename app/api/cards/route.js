/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new card
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               list_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Server error
 *   put:
 *     summary: Batch update card order and lists
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     card_id:
 *                       type: integer
 *                     list_id:
 *                       type: integer
 *                     order_index:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Cards reordered successfully
 *       500:
 *         description: Server error
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { Card } from "@/models";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();
        const { title, description, priority, due_date, order_index, list_id } = data;
        if (!title) {
            return NextResponse.json({
                success: false,
                message: "title not be empty",
            }, { status: 400 });
        }

        const maxOrder = await Card.max("order_index", { where: { list_id } });
        const nextOrder = (maxOrder !== null && Number.isFinite(maxOrder)) ? maxOrder + 1 : 0;

        const createdCard = await Card.create({
            title: title.trim(),
            description,
            priority: priority || "Medium",
            due_date,
            order_index: order_index !== undefined ? order_index : nextOrder,
            list_id
        });

        return NextResponse.json({
            success: true,
            message: "Card created successfully",
            card: createdCard
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "error while creating card or server error",
            error: error.message
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { cards } = body;

        if (!Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json({
                success: false,
                message: "cards array is required"
            }, { status: 400 });
        }

        await Promise.all(
            cards.map((c, idx) => {
                const cardId = c.card_id;
                const orderIndex = c.order_index !== undefined ? c.order_index : idx;
                const updatePayload = { order_index: orderIndex };
                if (c.list_id !== undefined) {
                    updatePayload.list_id = c.list_id;
                }
                return Card.update(updatePayload, { where: { card_id: cardId } });
            })
        );

        return NextResponse.json({
            success: true,
            message: "Cards reordered successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("Error reordering cards:", error);
        return NextResponse.json({
            success: false,
            message: "Error reordering cards",
            error: error.message
        }, { status: 500 });
    }
}
