import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';
import bookModel from "./bookModel.js";
import reserveModel from "./reserveModel.js";


// Buyer table : 
const buyerModel = sequelize.define('Buyer', {
    buyerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    buyerAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nationalID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true
});


export default buyerModel;


