const express = require('express');
const multer = require('multer');
const BookController = require('../controllers/bookController.js');

const router = express.Router();

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

module.exports = router;
