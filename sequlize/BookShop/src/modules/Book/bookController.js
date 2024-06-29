import authorModel from "../../../DB/model/authorModel.js";
import bookModel from "../../../DB/model/bookModel.js";
import publisherModel from "../../../DB/model/publisherModel.js";
import { Op } from 'sequelize';

export const addNewBook = async (req, res) => {
    try {
        const { bookTitle, bookPublisher, publishDate, bookAuthor, bookTags, availableUnits, unitPrice } = req.body;
        const bookPdf = req.file ? `/${req.file.filename}` : null;
        const tagsArray = bookTags ? bookTags.split(',').map(tag => tag.trim()) : [];

        const publisher = await publisherModel.findOne({
            where: { publisherName: bookPublisher },
            attributes: ['id']
        });

        if (!publisher) { return res.status(404).json({ message: "Publisher not found." }); }

        const nameParts = bookAuthor.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        const middleName = nameParts.slice(1, -1).join(' ');

        const author = await authorModel.findOne({
            where: { firstName, middleName, lastName },
            attributes: ['id']
        });
        if (!author) { return res.status(404).json({ message: "Author not found." }); }

        const existingBook = await bookModel.findOne({
            where: { bookTitle, PublisherId: publisher.id, AuthorId: author.id },
        });
        if (existingBook) {
            return res.status(400).json({ message: "Book already exists." });
        }

        const newBook = await bookModel.create(
            {
                bookTitle, PublisherId: publisher.id, publishDate, AuthorId: author.id, bookPdf, bookTags: tagsArray, availableUnits, unitPrice,
            });
        return res.status(201).json({ message: "Added successfully " });

    } catch (error) {
        return res.status(500).json({ message: 'Error adding book', error });
    }
};


export const searchBooks = async (req, res) => {
    try {
        const { bookTitle, bookPublisher, bookAuthor, tags, any, publishDateFrom, publishDateTo, priceFrom, priceTo } = req.body;

        let whereCondition = {};
        if (bookTitle) { whereCondition.bookTitle = { [Op.like]: `%${bookTitle}%` }; }
        if (bookPublisher) {
            const publisher = await publisherModel.findOne({
                where: { publisherName: bookPublisher },
                attributes: ['id']
            });
            if (publisher) { whereCondition.PublisherId = publisher.id; }
            else { return res.status(404).json({ message: "Publisher not found." }); }
        }
        if (bookAuthor) {
            const nameParts = bookAuthor.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
            const middleName = nameParts.slice(1, -1).join(' ');

            const author = await authorModel.findOne({
                where: { firstName, middleName, lastName },
                attributes: ['id']
            });
            if (author) { whereCondition.AuthorId = author.id; }
            else { return res.status(404).json({ message: "Author not found." }); }
        }
        if (tags) { whereCondition.bookTags = { [Op.like]: `%${tags}%` }; }
        /*
         if (tags && tags.length > 0) {
            whereCondition.bookTags = {
                [Op.or]: tags.map(tag => ({
                    [Op.like]: `%${tag}%`
                }))
            };
        }
        */
        if (any) {
            whereCondition[Op.or] = [
                { bookTitle: { [Op.like]: `%${any}%` } },
                { '$Publisher.publisherName$': { [Op.like]: `%${any}%` } },
                { bookTags: { [Op.like]: `%${any}%` } },
                { '$Author.firstName$': { [Op.like]: `%${any}%` } },
                { '$Author.middleName$': { [Op.like]: `%${any}%` } },
                { '$Author.lastName$': { [Op.like]: `%${any}%` } }
            ];
        }
        if (publishDateFrom && publishDateTo) {
            whereCondition.publishDate = { [Op.between]: [publishDateFrom, publishDateTo] };
        }
        if (priceFrom && priceTo) {
            whereCondition.unitPrice = { [Op.between]: [priceFrom, priceTo] };
        }
        const books = await bookModel.findAll({
            where: whereCondition,
            include: [
                { model: publisherModel, as: 'Publisher' },
                { model: authorModel, as: 'Author' }
            ]
        });
        const booksWithAvailability = books.map(book => {
            return {
                ID: book.id,
                Title: book.bookTitle,
                Publisher: book.Publisher.publisherName,
                PublishDate: book.publishDate,
                Author: `${book.Author.firstName} ${book.Author.middleName} ${book.Author.lastName}`,
                Tags: book.bookTags.join(', '),
                AvailableUnits: book.availableUnits,
                UnitPrice: book.unitPrice,
                Reserve: book.availableUnits === 0 ? 'false' : 'true'
            };
        });

        return res.status(200).json({ booksWithAvailability });
    } catch (error) {
        return res.status(500).json({ message: 'Error searching books', error });
    }
};