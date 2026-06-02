/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a new project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Project created successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all projects
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       500:
 *         description: Server error
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Project, Client } from "@/models";

export async function POST(req) {
    try {
        const data = await req.json();
        const project = await Project.create(data);

        return NextResponse.json(project, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const projects = await Project.findAll({
            include: {
                model: Client,
                attributes: ["full_name", "email", "company_name"],
            },
            // The projects table does not have created_at, so sort by PK (latest first).
            order: [["project_id", "DESC"]],
        });

        return NextResponse.json({ projects, message: "Projects retrieved successfully" });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}