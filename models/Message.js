import { DataTypes } from 'sequelize';
import sequelize from '@/config/sequelize';

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    room_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

}, { tableName: 'messages', timestamps: true });

export default Message;