import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';
import buyerModel from "./buyerModel.js";
import bookModel from './bookModel.js';


// Reserve table : 
const reserveModel = sequelize.define('Reserve', {
    purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    numberOfUnit: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    PaymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true
});
export default reserveModel;


