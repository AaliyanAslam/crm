import "server-only";
import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const ClientNote = sequelize.define("ClientNote", {
  note_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: DataTypes.INTEGER,
  note: DataTypes.TEXT,
  
}, {
  tableName: "client_notes",
  timestamps: false,
  underscored: true
  

});

export default ClientNote;