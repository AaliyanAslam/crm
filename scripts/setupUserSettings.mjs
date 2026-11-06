import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

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

async function setup() {
    const conn = await mysql.createConnection(DB_CONFIG);
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                phone VARCHAR(50) DEFAULT '+92 300 1234567',
                designation VARCHAR(100) DEFAULT 'Lead Software Engineer',
                department VARCHAR(100) DEFAULT 'Engineering',
                bio TEXT,
                timezone VARCHAR(100) DEFAULT 'Asia/Karachi (UTC+05:00)',
                language VARCHAR(50) DEFAULT 'en',
                status VARCHAR(50) DEFAULT 'Available',
                email_notifications TINYINT(1) DEFAULT 1,
                desktop_notifications TINYINT(1) DEFAULT 1,
                sound_enabled TINYINT(1) DEFAULT 1,
                auto_away_minutes INT DEFAULT 15,
                theme_preference VARCHAR(20) DEFAULT 'system',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log("✅ user_settings table successfully created or verified!");

        // Insert default settings for existing users if not present
        const [users] = await conn.query("SELECT user_id, name FROM users");
        for (const u of users) {
            await conn.query(`
                INSERT IGNORE INTO user_settings (user_id, bio, designation, department)
                VALUES (?, ?, ?, ?)
            `, [
                u.user_id,
                `Full-stack developer at CRM. Passionate about performant Next.js applications and cloud architecture.`,
                u.user_id === 1 ? 'Technical Lead & Admin' : 'Full Stack Developer',
                'Product Engineering'
            ]);
        }
        console.log(`✅ Verified user_settings rows for ${users.length} users.`);

    } catch (e) {
        console.error("❌ Error setting up user_settings:", e);
    } finally {
        await conn.end();
    }
}

setup();

