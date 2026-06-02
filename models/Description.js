import sequelize from "@/config/sequelize";
import { DataTypes } from "sequelize";

const Description = sequelize.define("descriptions", {
    description_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    card_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Cards",
            key: "card_id"
        },
        onDelete: "CASCADE"
    }
})

export default Description;