import { DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

const ChatRoom = sequelize.define("ChatRoom", {
    room_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: "chat_rooms"
})

export default ChatRoom;