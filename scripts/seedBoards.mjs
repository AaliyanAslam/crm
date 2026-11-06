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

const boardsSeed = [
    {
        name: "Client Onboarding & Intake",
        description: "Track new client registration, discovery calls, scoping documents, and SLA kickoff agreements.",
        bg_color: "#0284c7", // Sky 600
        lists: [
            {
                name: "Incoming Requests",
                cards: [
                    { title: "Review Apex Logics SLA agreement", priority: "High", description: "Review legal terms, payment schedules, and deliverable milestones." },
                    { title: "Client intake form for Nova Solutions", priority: "Medium", description: "Collect stakeholder emails and repo access credentials." },
                ],
            },
            {
                name: "Discovery & Scoping",
                cards: [
                    { title: "Architecture workshop with Vanguard team", priority: "High", description: "Align on cloud providers, databases, and third-party APIs." },
                ],
            },
            {
                name: "Contract & Legal",
                cards: [
                    { title: "Send countersigned MSA to Nordic Consult", priority: "Medium", description: "Finance team has approved payment terms." },
                ],
            },
            {
                name: "Ready for Kickoff",
                cards: [
                    { title: "Setup shared Slack channel & Linear board", priority: "Low", description: "Invite core stakeholders and schedule sprint zero meeting." },
                ],
            },
        ],
    },
    {
        name: "Nova CRM SaaS Sprint #14",
        description: "Core CRM engine development, websocket notifications, client portal performance, and table density.",
        bg_color: "#6366f1", // Indigo 500
        lists: [
            {
                name: "Sprint Backlog",
                cards: [
                    { title: "Socket.io reconnect resilience logic", priority: "High", description: "Handle network dropouts and rejoin rooms automatically." },
                    { title: "Add CSV export button to client directory", priority: "Medium", description: "Generate downloadable client records directly in browser." },
                ],
            },
            {
                name: "In Development",
                cards: [
                    { title: "Mobile responsive kanban layout adjustments", priority: "High", description: "Ensure horizontal dragging doesn't freeze viewport." },
                ],
            },
            {
                name: "Code Review",
                cards: [
                    { title: "Audit SQL indexes on client_id and created_at", priority: "Low", description: "Speed up queries on large client datasets." },
                ],
            },
            {
                name: "Done",
                cards: [
                    { title: "Clean up hydration warning script in layout.js", priority: "Medium", description: "Successfully removes bis_skin_checked attribute." },
                ],
            },
        ],
    },
    {
        name: "Apex Mobile Banking - v2.0",
        description: "Cross-platform mobile application personal finance tools, QR payments, and biometric authentication.",
        bg_color: "#059669", // Emerald 600
        lists: [
            {
                name: "To Do",
                cards: [
                    { title: "Biometric FaceID & Fingerprint authentication flow", priority: "High", description: "Integrate native secure enclave tokens." },
                    { title: "QR code merchant payment scanner", priority: "Medium", description: "Support instant EMVCo compliant merchant QR standards." },
                ],
            },
            {
                name: "In Progress",
                cards: [
                    { title: "Push notification payload encryption", priority: "High", description: "Ensure zero-knowledge data leak in transit." },
                ],
            },
            {
                name: "QA Testing",
                cards: [
                    { title: "Stress test currency conversion endpoints", priority: "Medium", description: "Verify real-time rates under 5,000 req/sec." },
                ],
            },
            {
                name: "Released",
                cards: [
                    { title: "Initial beta build deployed to TestFlight", priority: "Low", description: "50 internal testers invited." },
                ],
            },
        ],
    },
    {
        name: "Q3 Growth & Marketing Campaigns",
        description: "Agency B2B outreach, case study publications, webinar collateral, and inbound funnel optimization.",
        bg_color: "#d97706", // Amber 600
        lists: [
            {
                name: "Ideation",
                cards: [
                    { title: "B2B LinkedIn cold email drip sequence", priority: "Medium", description: "Draft 3-touch nurture sequence targeting SaaS founders." },
                ],
            },
            {
                name: "Copywriting",
                cards: [
                    { title: "Case study: How Apex scaled retention by 40%", priority: "High", description: "Interview stakeholders and write deep dive blog post." },
                ],
            },
            {
                name: "In Review",
                cards: [
                    { title: "Product launch webinar deck & slides", priority: "Medium", description: "30-minute interactive presentation with live demo." },
                ],
            },
            {
                name: "Live Campaigns",
                cards: [
                    { title: "Google Ads campaign: CRM Implementation Agency", priority: "High", description: "Optimizing keywords with high intent." },
                ],
            },
        ],
    },
    {
        name: "Infrastructure, Cloud & DevOps",
        description: "High availability Kubernetes cluster, multi-region database failover, and CI/CD pipeline automation.",
        bg_color: "#475569", // Slate 600
        lists: [
            {
                name: "Backlog",
                cards: [
                    { title: "Upgrade Node.js runtime & Alpine base images", priority: "Low", description: "Reduce docker image bundle footprint by 40%." },
                ],
            },
            {
                name: "Active Sprints",
                cards: [
                    { title: "Configure Redis cluster for session caching", priority: "High", description: "Set up master-replica Sentinel topology." },
                ],
            },
            {
                name: "Staging Validation",
                cards: [
                    { title: "Test automated database daily backups to S3", priority: "Medium", description: "Verify recovery time objective (RTO < 15 mins)." },
                ],
            },
            {
                name: "Production Deployed",
                cards: [
                    { title: "Cloudflare Turnstile & DDoS rate limiting rules", priority: "High", description: "Active on all public auth endpoints." },
                ],
            },
        ],
    },
    {
        name: "Vanguard Fleet Logistics Engine",
        description: "Fleet tracking dashboard with live telemetry, driver scheduling, and automated delivery dispatches.",
        bg_color: "#7c3aed", // Violet 600
        lists: [
            {
                name: "Product Requirements",
                cards: [
                    { title: "Telemetry ping listener specification", priority: "High", description: "Vehicle GPS packets received over MQTT." },
                ],
            },
            {
                name: "Engineering",
                cards: [
                    { title: "Route optimization heuristics algorithm", priority: "High", description: "Compute shortest multi-stop path for 20+ delivery vans." },
                ],
            },
            {
                name: "Testing",
                cards: [
                    { title: "Simulate offline mode sync with local SQLite", priority: "Medium", description: "Queue actions and replay upon network reconnect." },
                ],
            },
            {
                name: "Completed",
                cards: [
                    { title: "Driver mobile companion app wireframes", priority: "Low", description: "Approved by operations director." },
                ],
            },
        ],
    },
    {
        name: "Design System & UI Components",
        description: "Accessible Shadcn / Radix primitives, typography scale, OKLCH color palettes, and component library.",
        bg_color: "#0f766e", // Teal 700
        lists: [
            {
                name: "Backlog",
                cards: [
                    { title: "Accessible toggle switch component", priority: "Medium", description: "Keyboard accessible with role='switch' and aria-checked." },
                ],
            },
            {
                name: "In Design",
                cards: [
                    { title: "High-density table row states and hover menus", priority: "Low", description: "Consistent 36px row height with truncate utilities." },
                ],
            },
            {
                name: "In Code",
                cards: [
                    { title: "Recharts custom tooltip styling to match zinc-950", priority: "High", description: "Remove default white boxes, use dark modern tooltip." },
                ],
            },
            {
                name: "Documented",
                cards: [
                    { title: "Refactor global color tokens to OKLCH", priority: "High", description: "Tailwind v4 theme setup completed." },
                ],
            },
        ],
    },
    {
        name: "Bug Tracking & Quality Assurance",
        description: "Internal bug reports, browser regression testing, performance profiling, and patch releases.",
        bg_color: "#dc2626", // Red 600
        lists: [
            {
                name: "Reported Issues",
                cards: [
                    { title: "Investigate Safari 17 flexbox overflow bug", priority: "High", description: "Scrollbar appearing unexpectedly on horizontal cards." },
                ],
            },
            {
                name: "Under Investigation",
                cards: [
                    { title: "Profile memory leaks on socket room listener", priority: "Medium", description: "Check if socket event listeners are detached on unmount." },
                ],
            },
            {
                name: "Fix in Progress",
                cards: [
                    { title: "DnD column jumping on horizontal drag", priority: "High", description: "Prefix list and card draggable IDs correctly." },
                ],
            },
            {
                name: "Resolved",
                cards: [
                    { title: "Hydration error caused by Bitdefender extension", priority: "High", description: "Added pre-hydration script in layout.js." },
                ],
            },
        ],
    },
    {
        name: "Enterprise Security & Compliance (SOC2)",
        description: "Security posture reviews, access audits, role-based permissions, and data protection verification.",
        bg_color: "#1e293b", // Slate 800
        lists: [
            {
                name: "Audit Scope",
                cards: [
                    { title: "Review JWT secret entropy & expiration periods", priority: "High", description: "Ensure 256-bit secret key in production environment." },
                ],
            },
            {
                name: "Policy Drafting",
                cards: [
                    { title: "Draft employee laptop encryption & MDM policy", priority: "Medium", description: "Required for SOC2 Type II certification." },
                ],
            },
            {
                name: "Controls Implementation",
                cards: [
                    { title: "Enforce 2FA for all administrative accounts", priority: "High", description: "Mandatory TOTP authenticator setup on first login." },
                ],
            },
            {
                name: "Verified",
                cards: [
                    { title: "Quarterly vulnerability penetration test", priority: "High", description: "Zero high or critical severity vulnerabilities found." },
                ],
            },
        ],
    },
    {
        name: "Hiring & Talent Acquisition",
        description: "Candidate pipeline, technical interviews, code reviews, and offer negotiations for core team expansion.",
        bg_color: "#9333ea", // Purple 600
        lists: [
            {
                name: "Applied",
                cards: [
                    { title: "Senior Fullstack Engineer (Next.js / Node.js)", priority: "High", description: "5 candidates shortlisted for initial screen." },
                ],
            },
            {
                name: "Interviewing",
                cards: [
                    { title: "Lead Product Designer (B2B SaaS)", priority: "High", description: "Portfolio review and take-home design task scheduled." },
                ],
            },
            {
                name: "Technical Assessment",
                cards: [
                    { title: "DevOps & Cloud SRE Specialist", priority: "Medium", description: "Terraform & Kubernetes cluster challenge completed." },
                ],
            },
            {
                name: "Offer Sent",
                cards: [
                    { title: "Frontend Performance Specialist", priority: "High", description: "Offer letter delivered, awaiting final signoff." },
                ],
            },
        ],
    },
];

async function seedBoards() {
    console.log("Connecting to database:", DB_CONFIG.database, "at", DB_CONFIG.host);
    const conn = await mysql.createConnection(DB_CONFIG);

    try {
        console.log(`Starting to seed ${boardsSeed.length} boards with lists & cards...`);

        const now = new Date();

        let boardCount = 0;
        let listCount = 0;
        let cardCount = 0;

        for (const b of boardsSeed) {
            const [bRes] = await conn.execute(
                "INSERT INTO boards (name, bg_color, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                [b.name, b.bg_color, b.description, now, now]
            );
            const boardId = bRes.insertId;
            boardCount++;

            let listOrder = 0;
            for (const l of b.lists) {
                const [lRes] = await conn.execute(
                    "INSERT INTO lists (name, order_index, board_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                    [l.name, listOrder, boardId, now, now]
                );
                const listId = lRes.insertId;
                listOrder++;
                listCount++;

                let cardOrder = 0;
                for (const c of l.cards) {
                    const dueDate = new Date(Date.now() + (cardOrder + 2) * 86400000 * 3);
                    await conn.execute(
                        "INSERT INTO cards (title, description, priority, due_date, order_index, list_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [c.title, c.description, c.priority, dueDate, cardOrder, listId, now, now]
                    );
                    cardOrder++;
                    cardCount++;
                }
            }
        }

        const [totalBoards] = await conn.query("SELECT COUNT(*) as count FROM boards");
        const [totalLists] = await conn.query("SELECT COUNT(*) as count FROM lists");
        const [totalCards] = await conn.query("SELECT COUNT(*) as count FROM cards");

        console.log(`✅ Successfully seeded ${boardCount} boards, ${listCount} lists, and ${cardCount} cards!`);
        console.log(`📊 Current DB Totals -> Boards: ${totalBoards[0].count}, Lists: ${totalLists[0].count}, Cards: ${totalCards[0].count}`);
    } catch (err) {
        console.error("❌ Boards seeding failed:", err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

seedBoards();

