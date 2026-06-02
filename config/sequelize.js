import "server-only";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "devskarnel_crm",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);


let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await sequelize.authenticate();
    // await sequelize.sync();
    isConnected = true;
    console.log("✅ Database connected & synced successfully");
  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }
};

export default sequelize;