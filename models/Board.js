import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const Board = sequelize.define("Board", {
    board_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bg_color: {
        type: DataTypes.STRING,
        defaultValue: "#F8FAFC"
    },
    description: {
        type: DataTypes.TEXT,
    }
}, {
    tableName: "boards",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export default Board;