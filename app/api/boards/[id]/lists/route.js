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
 *               index_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: List created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Server error
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
 *               index_order:
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

export async function POST(req, { params }) {
    try {
        await connectDB();
        const data = await req.json();
        const { id } = await params;
        const { name, index_order } = data;

        if (!name) {
            return NextResponse.json({
                success: true,
                message: "Name is required",
            }, { status: 400 })
        }

        const createdList = await List.create({
            name,
            index_order: index_order || 1,
            board_id: id
        })
        return NextResponse.json({
            success: true,
            message: "List Created Successfully",
            createdList
        })
    } catch (error) {
        console.error("error white creating list", error.message);
        return NextResponse.json({
            success: false,
            message: "error while creating list",
            error: error.message
        })
    }
}


export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params; // List ID
        const body = await req.json();

        // List dhoondo
        const list = await List.findByPk(id);

        if (!list) {
            return NextResponse.json({
                success: false,
                message: "List not found",
            }, { status: 404 });
        }

        // Database update
        // Ye name aur index_order dono ko handle karega
        await list.update({
            name: body.name || list.name,
            index_order: body.index_order !== undefined ? body.index_order : list.index_order
        });

        return NextResponse.json({
            success: true,
            message: "List updated successfully",
            list
        });

    } catch (error) {
        console.error("Error while updating list:", error.message);
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
        
        // URL se List ki ID pakrein
        const { id } = await params; 

        // Database se list ko udaa dein
        const deletedCount = await List.destroy({
            where: { list_id: id }
        });

        // Check karein ke kya list waqai thi ya pehle hi delete ho chuki hai
        if (deletedCount === 0) {
            return NextResponse.json({
                success: false,
                message: "List nahi mili ya pehle hi delete ho chuki hai."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "List (aur uske cards) kamyabi se delete ho gaye! 🗑️"
        });

    } catch (error) {
        console.error("Error while deleting list:", error.message);
        return NextResponse.json({
            success: false,
            message: "List delete karne mein masla hua",
            error: error.message
        }, { status: 500 });
    }
}