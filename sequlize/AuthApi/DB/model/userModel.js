import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';
import tokenModel from "./tokenModel.js";


// user table : 
const userModel = sequelize.define('User', {
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
    }, age: {
        type: DataTypes.INTEGER
    },
    age: {
        type: DataTypes.INTEGER,
    },
}, {
    timestamps: true
});
userModel.hasOne(tokenModel, {
    onDelete: 'CASCADE'
});
tokenModel.belongsTo(userModel);
export default userModel;


