import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';

// token table : 
const tokenModel = sequelize.define('Token', {
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true
});

export default tokenModel;


