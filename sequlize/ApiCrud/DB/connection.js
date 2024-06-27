// connect to database : 

// data base informaion 
import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize('cruduser', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
// now connect with database :
export const connectDB = async () => {
    try {
        return await sequelize.sync({ alter: true });
    } catch (error) {
        console.log(`error DB : ${error.message}`);
    }
}
