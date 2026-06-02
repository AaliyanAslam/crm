import "server-only";
import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const Project = sequelize.define("Project", {
  project_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: DataTypes.INTEGER,
  project_name: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: DataTypes.STRING,
  budget: DataTypes.DECIMAL,
  start_date: DataTypes.DATE,
  deadline: DataTypes.DATE,
  priority: DataTypes.STRING,
  logo_url: DataTypes.STRING,
}, {
  tableName: "projects",
  timestamps: false,
});

export default Project;