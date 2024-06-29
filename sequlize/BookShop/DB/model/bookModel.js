import { sequelize } from "../connection.js";
import { DataTypes } from 'sequelize';
import buyerModel from "./buyerModel.js";
import reserveModel from "./reserveModel.js";


// book table : 
const bookModel = sequelize.define('Book', {
    bookTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    publishDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    bookPdf: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bookTags: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const value = this.getDataValue('bookTags');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('bookTags', JSON.stringify(value));
        }
    },
    availableUnits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    unitPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true
});



export default bookModel;


