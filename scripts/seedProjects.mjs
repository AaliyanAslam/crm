import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

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

const sampleProjects = [
    {
        client_id: 3,
        project_name: "Nova CRM SaaS Platform",
        description: "End-to-end customer management portal with real-time websocket notifications and role-based permissions.",
        status: "In Progress",
        budget: 28500,
        start_date: "2026-03-01",
        deadline: "2026-06-30",
        priority: "High",
        logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    },
    {
        client_id: 2,
        project_name: "Apex Mobile Banking App",
        description: "Cross-platform mobile application for personal finance management, biometric authentication, and QR payments.",
        status: "In Progress",
        budget: 42000,
        start_date: "2026-02-15",
        deadline: "2026-07-15",
        priority: "High",
        logo_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80",
    },
    {
        client_id: 4,
        project_name: "Vanguard Logistics Portal",
        description: "Fleet tracking dashboard with live telemetry, driver scheduling, and automated delivery dispatches.",
        status: "Planning",
        budget: 16500,
        start_date: "2026-04-10",
        deadline: "2026-08-20",
        priority: "Medium",
        logo_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80",
    },
    {
        client_id: 5,
        project_name: "Nordic ESG Compliance Hub",
        description: "Enterprise sustainability audit tool for EU CSRD reporting, carbon footprint metrics, and supply-chain auditing.",
        status: "Completed",
        budget: 34000,
        start_date: "2026-01-10",
        deadline: "2026-04-30",
        priority: "Medium",
        logo_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80",
    },
    {
        client_id: 6,
        project_name: "Orbit Cloud Migration & DevOps",
        description: "Kubernetes infrastructure modernization, CI/CD pipeline automation, and multi-region failover setup.",
        status: "In Progress",
        budget: 22000,
        start_date: "2026-03-20",
        deadline: "2026-06-15",
        priority: "High",
        logo_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80",
    },
    {
        client_id: 7,
        project_name: "Skyline Real Estate Marketplace",
        description: "Interactive commercial property listing engine with 3D virtual tours and mortgage calculation tools.",
        status: "On Hold",
        budget: 19000,
        start_date: "2026-02-01",
        deadline: "2026-09-01",
        priority: "Low",
        logo_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&auto=format&fit=crop&q=80",
    },
    {
        client_id: 8,
        project_name: "Nexus Healthcare Telemedicine",
        description: "HIPAA-compliant video consultation platform with integrated electronic health records and appointment scheduling.",
        status: "Planning",
        budget: 37500,
        start_date: "2026-05-01",
        deadline: "2026-10-15",
        priority: "High",
        logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80",
    },
];

async function seedProjects() {
    console.log("Connecting to database:", DB_CONFIG.database, "at", DB_CONFIG.host);
    const conn = await mysql.createConnection(DB_CONFIG);

    try {
        console.log(`Starting to seed ${sampleProjects.length} projects...`);

        const sql = `
            INSERT INTO projects (
                client_id, project_name, description, status,
                budget, start_date, deadline, priority, logo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        for (const p of sampleProjects) {
            await conn.execute(sql, [
                p.client_id,
                p.project_name,
                p.description,
                p.status,
                p.budget,
                p.start_date,
                p.deadline,
                p.priority,
                p.logo_url,
            ]);
            inserted++;
        }

        const [rows] = await conn.query("SELECT COUNT(*) as total FROM projects");
        console.log(`✅ Successfully seeded ${inserted} projects!`);
        console.log(`📊 Total projects in DB now: ${rows[0].total}`);
    } catch (err) {
        console.error("❌ Projects seeding failed:", err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

seedProjects();

