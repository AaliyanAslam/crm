/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update a comment by ID
 *     tags: [Comments]
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
 *               card_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
import { NextResponse } from "next/server";
import { Comment } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function DELETE(req, { params }) {

    try {
        await connectDB();
        const { id } = await params;
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return NextResponse.json({
                success: false,
                message: "comment not found",
            }, {
                status: 404
            })
        }
        const deletedComment = await Comment.destroy({
            where: {
                comment_id: id
            }
        })

        return NextResponse.json({
            success: true,
            message: "comment deleted successfully",
            deletedComment,
        }, {
            status: 200
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "comment not deleted , or server error ",
            error
        }, {
            status: 500
        })
    }

}




export async function PATCH(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const data = await req.json();

        // 1. Find the comment
        const comment = await Comment.findByPk(id);

        if (!comment) {
            return NextResponse.json({
                success: false,
                message: "Comment not found"
            }, { status: 404 });
        }
        await comment.update({
            text: data.text || comment.text,
            card_id: data.card_id || comment.card_id
        });

        return NextResponse.json({
            success: true,
            message: "Comment updated successfully",
            updatedComment: comment
        }, { status: 200 });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({
            success: false,
            message: "Comment update failed",
            error: error.message
        }, { status: 500 });
    }
}