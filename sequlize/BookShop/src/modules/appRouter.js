import { connectDB } from '../../DB/connection.js';
import bookRouter from './Book/bookRouter.js';
import authorRouter from './Author/authorRouter.js';
import publisherRouter from './Publisher/publisherRouter.js';
import reserveRouter from './Reserve/reserveRouter.js';
import Relations from '../../DB/relations.js';


export const initApp = (app, express) => {
    connectDB();
    app.use(express.json());
    app.get('/', (req, res) => {
        return res.json({ message: "welcome" });
    });
    app.use('/book', bookRouter);
    app.use('/author', authorRouter);
    app.use('/publisher', publisherRouter);
    app.use('/reserve', reserveRouter);
    Relations();

    app.use('*', (req, res) => {
        return res.json({ message: "page not found" });
    });
}