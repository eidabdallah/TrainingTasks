const { body, validationResult } = require('express-validator');
const knex = require('../../db/knex.js');


const reserveBooking = [
    body('NumberOfUnits').notEmpty().withMessage('Number of units is required').isInt({ min: 1 }).withMessage('Number of units must be a positive integer'),
    body('BookInfo').notEmpty().withMessage('Book information must be provided'),
    body('buyerName').notEmpty().withMessage('Buyer name is required'),
    body('buyerAddress').notEmpty().withMessage('Buyer address is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('nationalID').notEmpty().withMessage('National ID is required'),
    body('purchaseDate').notEmpty().withMessage('Purchase date is required').isISO8601().withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            NumberOfUnits, BookInfo, buyerName, buyerAddress, phoneNumber, nationalID, purchaseDate, paymentMethod } = req.body;

        if (paymentMethod !== 'Cash') {
            return res.status(400).json({ message: 'Only Cash payments are accepted.' });
        }

        let unitPrice, bookId;

        if (Number.isInteger(parseInt(BookInfo))) {
            bookId = parseInt(BookInfo);
            const book = await knex('books').where('id', bookId).first();
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
            if (book.availableUnits < NumberOfUnits) {
                return res.json({ message: `You cannot book this number, the number available is: ${book.availableUnits}` });
            }
            unitPrice = book.unitPrice;
        } else {
            const book = await knex('books').where('bookTitle', BookInfo).first();
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
            if (book.availableUnits < NumberOfUnits) {
                return res.json({ message: `You cannot book this number, the number available is: ${book.availableUnits}` });
            }
            bookId = book.id;
            unitPrice = book.unitPrice;
        }

        const existingBuyer = await knex('buyers').where({
            buyerName, phoneNumber, buyerAddress, nationalID
        }).first();

        let buyer;
        if (!existingBuyer) {
            [buyer] = await knex('buyers').insert({
                buyerName, phoneNumber, buyerAddress, nationalID
            }).returning('*');
        } else {
            buyer = existingBuyer;
        }

        await knex('reserves').insert({
            purchaseDate,
            numberOfUnit: NumberOfUnits,
            totalPrice: NumberOfUnits * unitPrice,
            PaymentMethod: paymentMethod,
            BookId: bookId,
            buyerId: buyer.id,
        });

        const book = await knex('books').where('id', bookId).first();
        const updatedAvailableUnits = book.availableUnits - NumberOfUnits;

        await knex('books').where('id', bookId).update({ availableUnits: updatedAvailableUnits });

        res.json({ message: 'Booking processed successfully.' });
    }
];

const getBookDetailsPage = async (req, res) => {
    try {
        const { bookId, bookTitle } = req.body;

        if (!bookId && !bookTitle) {
            return res.status(400).json({ message: 'Please provide either a bookId or BookTitle.' });
        }

        let book;
        if (bookId) {
            book = await knex('books')
                .where('books.id', bookId)
                .join('publishers', 'books.PublisherId', 'publishers.id')
                .join('authors', 'books.AuthorId', 'authors.id')
                .select('books.*', 'publishers.publisherName', 'authors.firstName', 'authors.middleName', 'authors.lastName')
                .first();
        } else if (bookTitle) {
            book = await knex('books')
                .where('books.bookTitle', bookTitle)
                .join('publishers', 'books.PublisherId', 'publishers.id')
                .join('authors', 'books.AuthorId', 'authors.id')
                .select('books.*', 'publishers.publisherName', 'authors.firstName', 'authors.middleName', 'authors.lastName')
                .first();
        }

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        const bookDetails = {
            publisher: book.publisherName,
            publishDate: book.publishDate,
            Author: `${book.firstName} ${book.middleName} ${book.lastName}`,
            availableUnits: book.availableUnits,
            unitPrice: book.unitPrice
        };

        return res.json({ bookDetails });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

const getPaymentDetailsPage = [
    body('bookInfo').notEmpty().withMessage('BookInfo is required'),
    body('NumberOfUnits').notEmpty().withMessage('Number of units is required').isInt({ min: 1 }).withMessage('Number of units must be a positive integer'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { bookInfo, NumberOfUnits } = req.body;

        let unitPrice, bookId;

        if (Number.isInteger(parseInt(bookInfo))) {
            bookId = parseInt(bookInfo);
            const book = await knex('books').where('id', bookId).first();
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
            if (book.availableUnits < NumberOfUnits) {
                return res.status(400).json({ message: `You cannot book this number, the number available is: ${book.availableUnits}` });
            }
            unitPrice = book.unitPrice;
        } else {
            const book = await knex('books').where('bookTitle', bookInfo).first();
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
            if (book.availableUnits < NumberOfUnits) {
                return res.status(400).json({ message: `You cannot book this number, the number available is: ${book.availableUnits}` });
            }
            unitPrice = book.unitPrice;
        }

        const totalPrice = unitPrice * NumberOfUnits;

        return res.json({
            UnitPrice: unitPrice,
            NumberOfUnits: NumberOfUnits,
            TotalPrice: totalPrice
        });
    }
];

module.exports = {
    reserveBooking,
    getBookDetailsPage,
    getPaymentDetailsPage
};

