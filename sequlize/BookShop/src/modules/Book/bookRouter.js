import { Router } from 'express';
import multer from 'multer';
import * as BookController from './bookController.js';


const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'BooksFile/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });
router.post('/addNewBook', upload.single('bookPdf'), BookController.addNewBook);
router.get('/searchBooks', BookController.searchBooks);




export default router;