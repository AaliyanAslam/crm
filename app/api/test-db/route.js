/**
 * @swagger
 * /api/test-db:
 *   get:
 *     summary: Test the database connection
 *     tags: [Test Db]
 *     responses:
 *       200:
 *         description: Database check completed
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";

export async function GET() {
  await connectDB();

  return NextResponse.json({
    message: "DB check done (see terminal)",
  });
}