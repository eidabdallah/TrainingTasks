import { connectDB } from '../../DB/connection.js';
import userRouter from './users/userRouter.js';


export const initApp = (app, express) => {
    connectDB();
    app.use(express.json());
    app.get('/', (req, res) => {
        return res.json({ message: "welcome" });
    });
    app.use('/user', userRouter);
    app.use('*', (req, res) => {
        return res.json({ message: "page not found" });
    });
}