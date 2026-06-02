/**
 * @swagger
 * /api/descriptions/{id}:
 *   delete:
 *     summary: Delete a description by ID
 *     tags: [Descriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Description deleted successfully
 *       404:
 *         description: Description not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update a description by ID
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
 *       200:
 *         description: Description updated successfully
 *       404:
 *         description: Description not found
 *       500:
 *         description: Server error
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { Description } from "@/models";


export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const description = await Description.findByPk(id);

        if (!description) {
            return NextResponse.json({
                success: false,
                message: "description not found ❌"
            }, { status: 404 })
        }

        const deletedDescription = await Description.destroy({
            where: { description_id: description.description_id }
        })
        return NextResponse.json({
            success: true,
            message: "descriptions deleted succesfully",
            deletedDescription: deletedDescription
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "descriptions not deleted or server error!",
        }, { status: 500 })
    }

}



export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();
        const { text } = data;

        const description = await Description.findByPk(id);
        if (!description) {
            return NextResponse.json({
                success: false,
                message: "description not exist"
            }, { status: 404 })
        }

        const updatedDescription = await description.update({
            text: text || description.text,
            description_id: description.description_id,
            card_id: description.card_id
        })

        return NextResponse.json({
            success: true,
            message: "description updated",
            updatedDescription: updatedDescription
        }, { status: 200 })



    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "description not updated or server error!"
        }, { status: 500 })
    }

}