/**
 * @swagger
 * /api/boards/{id}/lists:
 *   post:
 *     summary: Create a list for a board
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
 *       201:
 *         description: List created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Server error
 *   put:
 *     summary: Bulk reorder lists in a board
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
 *               lists:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     list_id:
 *                       type: integer
 *                     order_index:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Lists reordered successfully
 *       500:
 *         description: Server error
 */
import { connectDB } from "@/config/sequelize";
import List from "@/models/List";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const data = await req.json();
        const { id } = await params; // board_id
        const { name } = data;

        if (!name || !name.trim()) {
            return NextResponse.json({
                success: false,
                message: "Name is required",
            }, { status: 400 });
        }

        // Get max order_index in board so new list is placed at the end
        const maxOrder = await List.max("order_index", { where: { board_id: id } });
        const nextOrder = (maxOrder !== null && Number.isFinite(maxOrder)) ? maxOrder + 1 : 0;

        const createdList = await List.create({
            name: name.trim(),
            order_index: data.order_index !== undefined ? data.order_index : nextOrder,
            board_id: parseInt(id, 10),
        });

        return NextResponse.json({
            success: true,
            message: "List Created Successfully",
            createdList
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating list:", error);
        return NextResponse.json({
            success: false,
            message: "Error while creating list",
            error: error.message
        }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params; // board_id
        const body = await req.json();
        const { lists } = body;

        if (!Array.isArray(lists) || lists.length === 0) {
            return NextResponse.json({
                success: false,
                message: "lists array is required"
            }, { status: 400 });
        }

        // Batch update order_index for every list in this board
        await Promise.all(
            lists.map((item, idx) => {
                const listId = typeof item === "object" ? item.list_id : item;
                const orderIndex =
                    typeof item === "object" && item.order_index !== undefined
                        ? item.order_index
                        : idx;

                return List.update(
                    { order_index: orderIndex },
                    { where: { list_id: listId, board_id: id } }
                );
            })
        );

        return NextResponse.json({
            success: true,
            message: "Lists reordered successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error while reordering lists:", error);
        return NextResponse.json({
            success: false,
            message: "Error while reordering lists",
            error: error.message
        }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const listId = body.list_id || id;
        const list = await List.findByPk(listId);

        if (!list) {
            return NextResponse.json({
                success: false,
                message: "List not found",
            }, { status: 404 });
        }

        await list.update({
            name: body.name || list.name,
            order_index: body.order_index !== undefined ? body.order_index : list.order_index
        });

        return NextResponse.json({
            success: true,
            message: "List updated successfully",
            list
        }, { status: 200 });
    } catch (error) {
        console.error("Error while updating list:", error);
        return NextResponse.json({
            success: false,
            message: "Error while updating list",
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

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
        }, { status: 200 });
    } catch (error) {
        console.error("Error while deleting list:", error);
        return NextResponse.json({
            success: false,
            message: "List delete error",
            error: error.message
        }, { status: 500 });
    }
}
