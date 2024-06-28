import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';

// blog table : 
const blogModel = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});

export default blogModel;


