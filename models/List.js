import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const List = sequelize.define("List", {
    list_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    board_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "lists",
    timestamps: true,
    underscored: true
});

export default List;
