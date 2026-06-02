import sequelize from "@/config/sequelize";
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("Admin", "Member"),
        defaultValue: "Member"
    },
    image: {
        type: DataTypes.STRING,
    }

}, { timestamps: true, 
    tableName : "users"
 },


)


export default User;