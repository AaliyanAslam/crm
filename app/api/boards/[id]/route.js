/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: Get a board by ID
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board retrieved successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a board by ID
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
import { connectDB } from "@/config/sequelize";
import { Board, List, Card, Comment , Description } from "@/models/index";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const boardDetail = await Board.findByPk(id, {
            include: [
                {
                    model: List,
                    as: "lists",
                    include: [
                        {
                            model: Card,
                            as: "cards",
                            include: [
                                {
                                    model: Comment,
                                    as: "comments"
                                },
                                {
                                    model: Description,
                                    as: "descriptions"
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                [{ model: List, as: "lists" }, "order_index", "ASC"],
                [{ model: List, as: "lists" }, { model: Card, as: "cards" }, "order_index", "ASC"]
            ]
        });

        if (!boardDetail) {
            return NextResponse.json({
                success: false,
                message: "Board nahi mila! Check your ID."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            board: boardDetail
        }, { status: 200 });

    } catch (error) {
        console.error("Get Board Detail Error:", error);
        return NextResponse.json({
            success: false,
            message: "Server mein koi masla hua",
            error: error.message
        }, { status: 500 });
    }
}


export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const deleted = await Board.destroy({
            where: { board_id: id }
        });

        if (!deleted) {
            return NextResponse.json({
                success: false,
                message: "Bhai, ye Board pehle hi delete ho chuka hai ya mila hi nahi!"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Board aur uske andar ka saara data (Lists & Cards) delete ho gaya! 🗑️"
        }, { status: 200 });

    } catch (error) {
        console.error("Delete Board Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}