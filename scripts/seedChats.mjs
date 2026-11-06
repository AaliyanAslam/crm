import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import crypto from "crypto";

function loadEnv() {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx !== -1) {
                const key = trimmed.slice(0, eqIdx).trim();
                const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        }
    }
}

loadEnv();

const DB_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "devskarnel_crm",
};

const chatSeedData = [
    {
        name: "general-discussion",
        createdByEmail: "aaliyanaslam22@gmail.com",
        messages: [
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Good morning team! Welcome to the new sprint. All board backlogs have been populated.",
                minsAgo: 240,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "Morning @Aaliyan! Checking the client onboarding board right now. SLA review is almost complete.",
                minsAgo: 215,
            },
            {
                userEmail: "aaliyanaslam@gmail.com",
                text: "Design system 2.0 components are now live in the project repo. Let me know if you hit any token mismatches.",
                minsAgo: 160,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "Awesome, testing the responsive layouts on mobile and desktop right now.",
                minsAgo: 95,
            },
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Great work everyone. Let's aim to wrap up PR reviews before the 4 PM standup.",
                minsAgo: 25,
            },
        ],
    },
    {
        name: "project-alpha-crm",
        createdByEmail: "kasim@gmail.com",
        messages: [
            {
                userEmail: "kasim@gmail.com",
                text: "We migrated the settings hub to persistent MySQL storage. All 18 options are working with live SWR caching.",
                minsAgo: 320,
            },
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Reviewed the settings API route. The transaction handling looks very clean.",
                minsAgo: 290,
            },
            {
                userEmail: "aaliyanaslam@gmail.com",
                text: "Also verified that currency formats and theme settings propagate instantly to Clients and Projects.",
                minsAgo: 200,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "Perfect. Next step is wiring real-time socket events for board card movements.",
                minsAgo: 60,
            },
        ],
    },
    {
        name: "client-onboarding",
        createdByEmail: "aaliyanaslam22@gmail.com",
        messages: [
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Nova Solutions finalized their contract for the Enterprise CRM tier. Onboarding kickoff scheduled for Thursday.",
                minsAgo: 480,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "I'll prepare the initial workspace seed and provision their API tokens beforehand.",
                minsAgo: 450,
            },
            {
                userEmail: "aaliyanaslam@gmail.com",
                text: "Shared the intake checklist doc in their client notes. Vanguard team is also waiting on architecture sign-off.",
                minsAgo: 380,
            },
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Both accounts are in good standing. Keep an eye out for their webhook confirmation.",
                minsAgo: 110,
            },
        ],
    },
    {
        name: "design-and-ux",
        createdByEmail: "aaliyanaslam@gmail.com",
        messages: [
            {
                userEmail: "aaliyanaslam@gmail.com",
                text: "We replaced the cyan AI gradients across Dashboard, Clients, Projects, and Boards with clean Shadcn neutral zinc.",
                minsAgo: 360,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "The new UI feels 10x more professional and readable. Information density is much better.",
                minsAgo: 310,
            },
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Make sure all dialogs have proper focus management and Esc key handlers.",
                minsAgo: 180,
            },
            {
                userEmail: "aaliyanaslam@gmail.com",
                text: "Done! All modals close on Escape and prevent body scrolling.",
                minsAgo: 70,
            },
        ],
    },
    {
        name: "devops-and-cloud",
        createdByEmail: "kasim@gmail.com",
        messages: [
            {
                userEmail: "kasim@gmail.com",
                text: "Database connection pool tuned to max 10 connections with automatic keep-alive ping.",
                minsAgo: 500,
            },
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Socket server ping interval adjusted to 20s to prevent accidental disconnects on flaky networks.",
                minsAgo: 420,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "Testing socket failover now. Graceful reconnection logic works as expected.",
                minsAgo: 140,
            },
        ],
    },
    {
        name: "product-roadmap",
        createdByEmail: "aaliyanaslam22@gmail.com",
        messages: [
            {
                userEmail: "aaliyanaslam22@gmail.com",
                text: "Q3 objectives: 1) Advanced Gantt timeline for projects, 2) Multi-channel notification center, 3) Full CSV/PDF export suite.",
                minsAgo: 600,
            },
            {
                userEmail: "kasim@gmail.com",
                text: "Clients CSV export is already implemented. We can reuse that streaming pattern for Projects and Invoices.",
                minsAgo: 530,
            },
            {
                userEmail: "aaliyanaslam@gmail.com",
                text: "Agreed. Let's prioritize real-time team collaboration first so customers can invite sub-teams.",
                minsAgo: 45,
            },
        ],
    },
];

async function seedChats() {
    console.log(`Connecting to database: ${DB_CONFIG.database} at ${DB_CONFIG.host}`);
    const conn = await mysql.createConnection(DB_CONFIG);

    try {
        // Fetch existing users
        const [users] = await conn.query("SELECT user_id, email, name FROM users");
        if (!users.length) {
            console.error("❌ No users found in users table. Please create a user first.");
            process.exit(1);
        }

        const userMap = new Map();
        users.forEach((u) => userMap.set(u.email.toLowerCase(), u.user_id));
        const defaultUserId = users[0].user_id;

        // Clean out old dummy rooms if named 'dd' or 'scots'
        await conn.query("DELETE FROM chat_rooms WHERE name IN ('dd', 'scots')");

        let totalRoomsCreated = 0;
        let totalMessagesCreated = 0;

        for (const roomData of chatSeedData) {
            const creatorId = userMap.get(roomData.createdByEmail.toLowerCase()) || defaultUserId;

            // Check if room already exists
            const [existing] = await conn.query(
                "SELECT room_id FROM chat_rooms WHERE name = ?",
                [roomData.name]
            );

            let roomId;
            if (existing.length > 0) {
                roomId = existing[0].room_id;
                console.log(`ℹ️ Room "#${roomData.name}" already exists (${roomId}).`);
            } else {
                roomId = crypto.randomUUID();
                const createdAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
                await conn.query(
                    "INSERT INTO chat_rooms (room_id, name, created_by, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
                    [roomId, roomData.name, creatorId, createdAt, createdAt]
                );
                totalRoomsCreated++;
                console.log(`✅ Created room "#${roomData.name}" (${roomId})`);
            }

            // Seed messages if none exist in this room
            const [existingMsgs] = await conn.query(
                "SELECT count(*) as cnt FROM messages WHERE room_id = ?",
                [roomId]
            );

            if (existingMsgs[0].cnt === 0) {
                for (const msg of roomData.messages) {
                    const senderId = userMap.get(msg.userEmail.toLowerCase()) || defaultUserId;
                    const msgDate = new Date(Date.now() - msg.minsAgo * 60 * 1000);

                    await conn.query(
                        "INSERT INTO messages (room_id, user_id, text, isEdited, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
                        [roomId, senderId, msg.text, false, msgDate, msgDate]
                    );
                    totalMessagesCreated++;
                }
                console.log(`   ↳ Seeded ${roomData.messages.length} messages in "#${roomData.name}"`);
            }
        }

        const [roomCount] = await conn.query("SELECT count(*) as c FROM chat_rooms");
        const [msgCount] = await conn.query("SELECT count(*) as c FROM messages");

        console.log(`\n🎉 Chat seeding completed!`);
        console.log(`📊 DB Status -> Chat Rooms: ${roomCount[0].c}, Total Messages: ${msgCount[0].c}`);

    } catch (err) {
        console.error("❌ Error seeding chats:", err);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

seedChats();

