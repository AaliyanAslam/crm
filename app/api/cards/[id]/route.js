/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Delete a card by ID
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update a card by ID
 *     tags: [Cards]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               list_id:
 *                 type: integer
 *               due_date:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card updated successfully
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
import { NextResponse } from "next/server";
import { Card } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const deletedCard = await Card.destroy({
            where: { card_id: id }
        })
        if (deletedCard === 0) {
            return NextResponse.json({
                success: false,
                message: "card doesnt exists"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "card deleted successfully",
            deletedCard: deletedCard
        }, { status: 200 })
    } catch (error) {
        console.error("server error or", error)
        return NextResponse.json({
            success: false,
            message: "card no deletd",
            error
        }, { status: 500 })
    }
}


export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();
        const card = await Card.findByPk(id);

        if (!card) {
            return NextResponse.json({
                success: false,
                message: "Card nahi mila!"
            }, { status: 404 });
        }


        await card.update({
            title: data.title || card.title,
            description: data.description !== undefined ? data.description : card.description,
            list_id: data.list_id || card.list_id,
            due_date : data.due_date || card.due_date,
            order_index: data.order_index !== undefined ? data.order_index : card.order_index,
            priority: data.priority || card.priority
        });

        return NextResponse.json({
            success: true,
            message: "Card updated successfully! ✨",
            card: card,
        }, { status: 200 });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

