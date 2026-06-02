/**
 * @swagger
 * /api/notes/{id}:
 *   post:
 *     summary: Create a note for a client
 *     tags: [Notes]
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
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Server error
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ClientNote } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { note } = await req.json();

    if (!note) {
      return NextResponse.json({ message: "Note is required" }, { status: 400 });
    }

    const newNote = await ClientNote.create({
      client_id: id,
      note,
    });

    return NextResponse.json(newNote, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const note = await ClientNote.findOne({
      where: {
        note_id: id
      }
    });

    if (!note) {
      return NextResponse.json({
        success: false,
        message: "client not found"
      }, { status: 404 })
    }

    const deletedClientNote = await note.destroy();
    return NextResponse.json({
      success: true,
      message: "note deleted success",
      deletedClientNote
    }, { status: 200 })


  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "server error",
      error: error.message
    }, { status: 500 })
  }

}