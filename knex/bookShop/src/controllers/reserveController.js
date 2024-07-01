const { body, validationResult } = require('express-validator');
const knex = require('../../db/knex.js');

const bookDetails = [
    body('NumberOfUnits').notEmpty().withMessage('Number of units is required').isInt({ min: 1 }).withMessage('Number of units must be a positive integer'),
    body('BookInfo').notEmpty().withMessage('Book information must be provided'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { NumberOfUnits, BookInfo } = req.body;

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

        const [reserveRecordId] = await knex('temporaryreserves').insert({
            BookInfo: bookId,
            NumberOfUnits,
            price: unitPrice,
        });

        res.json({ message: 'Book details saved', Reserveid: reserveRecordId });
    }
];

const buyerDetails = [
    body('Reserveid').notEmpty().withMessage('Reserve ID is required'),
    body('buyerName').notEmpty().withMessage('Buyer name is required'),
    body('buyerAddress').notEmpty().withMessage('Buyer address is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('nationalID').notEmpty().withMessage('National ID is required'),
    body('purchaseDate').notEmpty().withMessage('purchaseDate ID is required').isISO8601().withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { Reserveid, buyerName, buyerAddress, phoneNumber, nationalID, purchaseDate } = req.body;

        const record = await knex('temporaryreserves').where('id', Reserveid).first();
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        await knex('temporaryreserves').where('id', Reserveid).update({
            buyerName,
            phoneNumber,
            buyerAddress,
            nationalID,
            purchaseDate
        });

        res.json({ message: 'Buyer details saved', Reserveid });
    }
];

const paymentDetails = [
    body('Reserveid').notEmpty().withMessage('Reserve ID is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { Reserveid, paymentMethod } = req.body;

        if (paymentMethod !== 'Cash') {
            return res.status(400).json({ message: 'Only Cash payments are accepted.' });
        }

        const reservation = await knex('temporaryReserves').where('id', Reserveid).first();
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation record not found.' });
        }

        const existingBuyer = await knex('buyers').where({
            buyerName: reservation.buyerName,
            phoneNumber: reservation.phoneNumber,
            buyerAddress: reservation.buyerAddress,
            nationalID: reservation.nationalID
        }).first();

        let buyer;
        if (!existingBuyer) {
            [buyer] = await knex('buyers').insert({
                buyerName: reservation.buyerName,
                phoneNumber: reservation.phoneNumber,
                buyerAddress: reservation.buyerAddress,
                nationalID: reservation.nationalID
            }).returning('*');
        } else {
            buyer = existingBuyer;
        }

        await knex('reserves').insert({
            purchaseDate: reservation.purchaseDate,
            numberOfUnit: reservation.NumberOfUnits,
            totalPrice: reservation.NumberOfUnits * reservation.price,
            PaymentMethod: paymentMethod,
            BookId: reservation.BookInfo,
            buyerId: buyer.id,
        });

        const book = await knex('books').where('id', reservation.BookInfo).first();
        const updatedAvailableUnits = book.availableUnits - reservation.NumberOfUnits;

        await knex('books').where('id', reservation.BookInfo).update({ availableUnits: updatedAvailableUnits });

        await knex('temporaryReserves').where('id', Reserveid).del();

        res.json({ message: 'Payment details saved successfully.' });
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
    body('reserveId').notEmpty().withMessage('Reserve ID is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { reserveId } = req.body;

        const reservation = await knex('temporaryreserves').where('id', reserveId).first();
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation record not found.' });
        }

        const totalPrice = reservation.price * reservation.NumberOfUnits;

        return res.json({
            UnitPrice: reservation.price,
            numberOfUnits: reservation.NumberOfUnits,
            totalPrice
        });
    }
];

module.exports = {
    bookDetails,
    buyerDetails,
    paymentDetails,
    getBookDetailsPage,
    getPaymentDetailsPage
};

