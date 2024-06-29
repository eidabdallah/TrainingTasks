// connect to database : 

// data base information 
import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize('bookshop', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
// now connect with database :
export const connectDB = async () => {
    try {
        console.log("Connect with Database.....");
        return await sequelize.sync({ alter: true });
    } catch (error) {
        console.log(`error DB : ${error.message}`);
    }
}
