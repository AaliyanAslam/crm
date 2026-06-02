/**
 * @swagger
 * /api/lists/{id}:
 *   patch:
 *     summary: Update a list by ID
 *     tags: [Lists]
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
 *               name:
 *                 type: string
 *               order_index:
 *                 type: integer
 *     responses:
 *       200:
 *         description: List updated successfully
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a list by ID
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List deleted successfully
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 */
import { connectDB } from "@/config/sequelize";
import List from "@/models/List";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        // Find the list
        const list = await List.findByPk(id);

        if (!list) {
            return NextResponse.json({
                success: false,
                message: "List not found",
            }, { status: 404 });
        }

        // Update list (name, order_index, etc)
        await list.update({
            name: body.name || list.name,
            order_index: body.order_index !== undefined ? body.order_index : list.order_index
        });

        return NextResponse.json({
            success: true,
            message: "List updated successfully",
            list
        });

    } catch (error) {
        console.error("Error updating list:", error.message);
        return NextResponse.json({
            success: false,
            message: "Error updating list",
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // Delete the list
        const deletedCount = await List.destroy({
            where: { list_id: id }
        });

        if (deletedCount === 0) {
            return NextResponse.json({
                success: false,
                message: "List not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "List deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting list:", error.message);
        return NextResponse.json({
            success: false,
            message: "Error deleting list",
            error: error.message
        }, { status: 500 });
    }
}
