/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Replace a project by ID
 *     tags: [Project]
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
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Partially update a project by ID
 *     tags: [Project]
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
 *         description: Project updated successfully
 *       400:
 *         description: Invalid request payload
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Project } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await Project.update(body, {
      where: { project_id: id },
    });

    if (!updated) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully" });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "No data provided" }, { status: 400 });
    }

    const [affectedRows] = await Project.update(data, {
      where: { project_id: id },
    });

    if (affectedRows === 0) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Data updated successfully", affectedRows });

  } catch (error) {
    return NextResponse.json({ message: "Error while updating project", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB(); // Database se connect karna zaroori hai
    const { id } = await params;

    // Sequelize mein delete karne ke liye .destroy() use hota hai
    const deletedCount = await Project.destroy({
      where: { project_id: id },
    });

    // Agar 0 rows delete hui, iska matlab project nahi mila
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error while deleting project", error: error.message },
      { status: 500 }
    );
  }
}