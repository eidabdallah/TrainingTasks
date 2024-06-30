const knex = require('../../db/knex.js');

const bookDetails = async (req, res) => {
    try {
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

        const reserveRecord = await knex('temporaryreserves').insert({
            BookInfo: bookId,
            NumberOfUnits,
            price: unitPrice,
        });

        res.json({ message: 'Book details saved', reserveRecordId: reserveRecord[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

const buyerDetails = async (req, res) => {
    try {
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

        res.json({ message: 'Buyer details saved' });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

const paymentDetails = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

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


const getPaymentDetailsPage = async (req, res) => {
    try {
        const { reserveId } = req.params;

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
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};


module.exports = {
    bookDetails,
    buyerDetails,
    paymentDetails,
    getBookDetailsPage,
    getPaymentDetailsPage
};
