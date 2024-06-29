import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';

// temporaryReserve Table
const temporaryReserveModel = sequelize.define('temporaryReserve', {
    BookInfo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    NumberOfUnits: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }, buyerName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    buyerAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nationalID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }, purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true
});

export default temporaryReserveModel;


