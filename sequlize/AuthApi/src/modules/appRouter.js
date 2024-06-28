import { connectDB } from '../../DB/connection.js';
import authRouter from './Auth/authRouter.js';

export const initApp = (app, express) => {
    connectDB();
    app.use(express.json());
    app.get('/', (req, res) => {
        return res.json({ message: "welcome" });
    });
    app.use('/auth', authRouter);
    app.use('*', (req, res) => {
        return res.json({ message: "page not found" });
    });
}