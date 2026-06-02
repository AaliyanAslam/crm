import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const Card = sequelize.define("Card", {
    card_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM("Low", "Medium", "High"),
        defaultValue: "Medium"
    },
    due_date: {
        type: DataTypes.DATE
    },
    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    list_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "cards",
    timestamps: true,
    underscored: true

})

export default Card;