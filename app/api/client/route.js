/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Create a new client
 *     tags: [Client]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all clients
 *     tags: [Client]
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *       500:
 *         description: Server error
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Client } from "@/models";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.full_name || !body.email) {
      return NextResponse.json(
        { message: "Full name and email are required" },
        { status: 400 }
      );
    }

    const client = await Client.create(body);

    return NextResponse.json({
      id: client.client_id,
      message: "Client data added successfully!",
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await Client.findAll({
      order: [["client_id", "DESC"]],
    });

    return NextResponse.json(clients);

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}