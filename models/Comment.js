import sequelize from "@/config/sequelize";
import { DataTypes } from "sequelize";

const Comment = sequelize.define("comment", {
    comment_id: {
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
}, {
    timestamps: true
})

export default Comment;