
import bookModel from "../../../DB/model/bookModel.js";
import buyerModel from "../../../DB/model/buyerModel.js";
import reserveModel from "../../../DB/model/reserveModel.js";
import publisherModel from "../../../DB/model/publisherModel.js";
import authorModel from "../../../DB/model/authorModel.js";

import temporaryReserveModel from "../../../DB/model/temporaryReserveTable.js";

export const bookDetails = async (req, res) => {
    try {
        const { NumberOfUnits, BookInfo } = req.body;

        let unitPrice, bookId;

        if (Number.isInteger(parseInt(BookInfo))) {

            bookId = parseInt(BookInfo);
            const book = await bookModel.findByPk(bookId);
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
            if (book.availableUnits < NumberOfUnits) {
                return res.json({ message: `You cannot book this number, the number available is: ${book.availableUnits}` });
            }
            unitPrice = book.unitPrice;
        } else {
            const book = await bookModel.findOne({ where: { bookTitle: BookInfo } });
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
            if (book.availableUnits < NumberOfUnits) {
                return res.json({ message: `You cannot book this number, the number available is: ${book.availableUnits}` });
            }
            return res.status(404).json(book);
            bookId = book.id;
            unitPrice = book.unitPrice;
        }
        const reserveRecored = await temporaryReserveModel.create({
            BookInfo: bookId, NumberOfUnits, price: unitPrice,
        });
        res.json({ message: 'Book details saved', reserveRecoredId: reserveRecored.id });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

export const buyerDetails = async (req, res) => {
    try {
        const { Reserveid, buyerName, buyerAddress, phoneNumber, nationalID, purchaseDate } = req.body;

        const record = await temporaryReserveModel.findByPk(Reserveid);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        await temporaryReserveModel.update({
            buyerName, phoneNumber, buyerAddress, nationalID, purchaseDate
        }, {
            where: { id: Reserveid }
        });
        res.json({ message: 'Buyer details saved' });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

export const paymentDetails = async (req, res) => {
    try {
        const { Reserveid, paymentMethod } = req.body;

        if (paymentMethod !== 'Cash') {
            return res.status(400).json({ message: 'Only Cash payments are accepted.' });
        }
        // reservation Information
        const reservation = await temporaryReserveModel.findOne({ where: { id: Reserveid } });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation record not found.' });
        }

        // insert Buyer infromation : 
        const existingBuyer = await buyerModel.findOne({
            where: {
                buyerName: reservation.buyerName,
                phoneNumber: reservation.phoneNumber,
                buyerAddress: reservation.buyerAddress,
                nationalID: reservation.nationalID
            }
        });
        let buyer;
        if (!existingBuyer) {
            buyer = await buyerModel.create({
                buyerName: reservation.buyerName,
                phoneNumber: reservation.phoneNumber,
                buyerAddress: reservation.buyerAddress,
                nationalID: reservation.nationalID
            });
        } else {
            buyer = existingBuyer;
        }

        // insert reservation : 
        await reserveModel.create({
            //purchaseDate: new Date(),
            purchaseDate: reservation.purchaseDate,
            numberOfUnit: reservation.NumberOfUnits,
            totalPrice: reservation.NumberOfUnits * reservation.price,
            PaymentMethod: paymentMethod,
            BookId: reservation.BookInfo,
            BuyerId: buyer.id,
        });
        // update availableUnits from book : 
        const book = await bookModel.findByPk(reservation.BookInfo);
        const updatedAvailableUnits = book.availableUnits - reservation.NumberOfUnits;
        await book.update({ availableUnits: updatedAvailableUnits });

        await temporaryReserveModel.destroy({ where: { id: Reserveid } });

        res.json({ message: 'Payment details saved successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};

export const getBookDetailsPage = async (req, res) => {
    try {
        const bookId = req.body.bookId;
        const bookTitle = req.body.bookTitle;
        if (!bookId && !bookTitle) {
            return res.status(400).json({ message: 'Please provide either a bookId or BookTitle.' });
        }
        let book;
        if (bookId) {
            book = await bookModel.findByPk(bookId, {
                include: [
                    { model: publisherModel, as: 'Publisher' },
                    { model: authorModel, as: 'Author' }
                ]
            });
        } else if (bookTitle) {
            book = await bookModel.findOne({
                where: { bookTitle },
                include: [
                    { model: publisherModel, as: 'Publisher' },
                    { model: authorModel, as: 'Author' }
                ]
            });
        }
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }
        const bookDetails = {
            publisher: book.Publisher.publisherName,
            publishDate: book.publishDate,
            Author: `${book.Author.firstName} ${book.Author.middleName} ${book.Author.lastName}`, availableUnits: book.availableUnits,
            unitPrice: book.unitPrice
        };

        return res.json({ bookDetails });
    } catch (error) {
        return res.status(500).json({ message: 'Error', error: error.stack });
    }
};
export const getPaymentDetailsPage = async (req, res) => {
    try {
        const { reserveId } = req.params;
        const reservation = await temporaryReserveModel.findByPk(reserveId);
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