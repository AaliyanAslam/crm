/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *       500:
 *         description: Server error
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ClientNote } from "@/models";

export async function GET() {
  try {
    const notes = await ClientNote.findAll();
    return NextResponse.json(notes);

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}