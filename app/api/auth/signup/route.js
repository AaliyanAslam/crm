
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Get a board by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board retrieved successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a board by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import User from "@/models/User";
import bcrypt from "bcrypt"

export async function POST(req) {
    try {
        await connectDB();
        const { name, email, password, role, image } = await req.json()

        const existingUser = await User.findOne({
            where: {
                email: email
            }
        })

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: 'user already registered'

            }, { status: 400 })
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            image: image || ""
        })


        return NextResponse.json({
            success: true,
            message: 'user registered',
            createdUser

        }, { status: 201 })


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'server error',
            error: error.message

        }, { status: 500 })
    }

}



