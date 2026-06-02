/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Replace a client by ID
 *     tags: [Client]
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
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Client, ClientNote } from "@/models";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const client = await Client.findByPk(id);

    if (!client) {
      return NextResponse.json({ message: "Client not found", }, { status: 404 });
    }

    const notes = await ClientNote.findAll({
      where: { client_id: id },
      // order: [["created_at", "DESC"]],
    });

    return NextResponse.json({ client, notes });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await Client.update(body, {
      where: { client_id: id },
    });

    if (!updated) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully" });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const deleted = await Client.destroy({
      where: { client_id: id },
    });

    if (!deleted) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}