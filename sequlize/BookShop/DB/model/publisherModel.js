import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';
import bookModel from "./bookModel.js";

const publisherModel = sequelize.define('Publisher', {
    publisherName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    establishDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    isStillWorking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});

export default publisherModel;
