import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';
import bookModel from "./bookModel.js";

const authorModel = sequelize.define('Author', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    middleName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    countryOfResidence: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deathDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    officialWebsite: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


export default authorModel;
