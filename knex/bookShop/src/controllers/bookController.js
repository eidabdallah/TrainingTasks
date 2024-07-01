const knex = require('../../db/knex.js');
const { body, validationResult } = require('express-validator');


const addNewBook = [
    body('bookTitle').notEmpty().withMessage('Book title is required'),
    body('bookPublisher').notEmpty().withMessage('Book publisher is required'),
    body('publishDate').notEmpty().withMessage('Publish date is required').isISO8601().withMessage('Publish date must be a valid date (YYYY-MM-DD)'),
    body('bookAuthor').notEmpty().withMessage('Book author is required'),
    body('bookTags').notEmpty().withMessage('Book tags are required').isString().withMessage('Book tags must be a string'),
    body('availableUnits').notEmpty().withMessage('Available units are required').isInt({ min: 0 }).withMessage('Available units must be a positive integer'),
    body('unitPrice').notEmpty().withMessage('Unit price is required').isInt({ min: 1 }).withMessage('Unit price must be a positive number'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { bookTitle, bookPublisher, publishDate, bookAuthor, bookTags, availableUnits, unitPrice } = req.body;
        const { file } = req;
        if (!file) {
            return res.status(400).json({ message: "Book PDF is required." });
        }
        const bookPdf = `/${file.filename}`;

        const tagsArray = bookTags ? bookTags.split(',').map(tag => tag.trim()) : [];
        const publisher = await knex('publishers').where('publisherName', bookPublisher).first('id');
        if (!publisher) {
            return res.status(404).json({ message: "Publisher not found." });
        }

        const authorNameParts = bookAuthor.split(' ');
        const firstName = authorNameParts[0];
        const lastName = authorNameParts[authorNameParts.length - 1];
        const middleName = authorNameParts.slice(1, -1).join(' ');

        const author = await knex('authors')
            .where({
                firstName,
                lastName,
                middleName
            })
            .first('id');
        if (!author) {
            return res.status(404).json({ message: "Author not found." });
        }

        const existingBook = await knex('books')
            .where({
                bookTitle,
                PublisherId: publisher.id,
                AuthorId: author.id
            })
            .first();
        if (existingBook) {
            return res.status(400).json({ message: "Book already exists." });
        }

        await knex('books').insert({
            bookTitle,
            PublisherId: publisher.id,
            publishDate,
            AuthorId: author.id,
            bookPdf,
            bookTags: JSON.stringify(tagsArray),
            availableUnits,
            unitPrice
        });

        return res.status(201).json({ message: "Book added successfully." });
    }
];

const searchBooks = [
    body('bookTitle').optional().notEmpty().withMessage('Book title must not be empty'),
    body('bookPublisher').optional().notEmpty().withMessage('Book publisher must not be empty'),
    body('bookAuthor').optional().notEmpty().withMessage('Book author must not be empty'),
    body('tags').optional().notEmpty().withMessage('Tags must not be empty'),
    body('any').optional().notEmpty().withMessage('Any field must not be empty'),
    body('publishDateFrom').notEmpty().isISO8601().withMessage('Publish date from must be a valid date (YYYY-MM-DD)'),
    body('publishDateTo').notEmpty().isISO8601().withMessage('Publish date to must be a valid date (YYYY-MM-DD)'),
    body('priceFrom').notEmpty().isInt({ min: 0 }).withMessage('Price from must be a valid positive number'),
    body('priceTo').notEmpty().isInt({ min: 0 }).withMessage('Price to must be a valid positive number'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { bookTitle, bookPublisher, bookAuthor, tags, any, publishDateFrom, publishDateTo, priceFrom, priceTo } = req.body;

        let query = knex('books')
            .select('books.id', 'books.bookTitle', 'books.publishDate', 'books.bookPdf', 'books.bookTags', 'books.availableUnits', 'books.unitPrice')
            .leftJoin('publishers', 'books.PublisherId', 'publishers.id')
            .leftJoin('authors', 'books.AuthorId', 'authors.id');

        if (bookTitle) {
            query = query.where('books.bookTitle', 'like', `%${bookTitle}%`);
        }
        if (bookPublisher) {
            const publisher = await knex('publishers').where('publisherName', bookPublisher).first('id');
            if (publisher) {
                query = query.where('books.PublisherId', publisher.id);
            } else {
                return res.status(404).json({ message: "Publisher not found." });
            }
        }
        if (bookAuthor) {
            const authorNameParts = bookAuthor.split(' ');
            const firstName = authorNameParts[0];
            const lastName = authorNameParts[authorNameParts.length - 1];
            const middleName = authorNameParts.slice(1, -1).join(' ');

            const author = await knex('authors')
                .where({
                    firstName,
                    lastName,
                    middleName
                })
                .first('id');
            if (author) {
                query = query.where('books.AuthorId', author.id);
            } else {
                return res.status(404).json({ message: "Author not found." });
            }
        }
        if (tags) {
            query = query.where('books.bookTags', 'like', `%${tags}%`);
        }
        if (any) {
            query = query.where(function () {
                this.where('books.bookTitle', 'like', `%${any}%`)
                    .orWhere('publishers.publisherName', 'like', `%${any}%`)
                    .orWhere('books.bookTags', 'like', `%${any}%`)
                    .orWhere('authors.firstName', 'like', `%${any}%`)
                    .orWhere('authors.middleName', 'like', `%${any}%`)
                    .orWhere('authors.lastName', 'like', `%${any}%`);
            });
        }
        if (publishDateFrom && publishDateTo) {
            query = query.whereBetween('books.publishDate', [publishDateFrom, publishDateTo]);
        }
        if (priceFrom && priceTo) {
            query = query.whereBetween('books.unitPrice', [priceFrom, priceTo]);
        }

        const books = await query;
        const booksWithAvailability = books.map(book => ({
            ID: book.id,
            Title: book.bookTitle,
            PublishDate: book.publishDate,
            BookPdf: book.bookPdf,
            BookTags: JSON.parse(book.bookTags),
            AvailableUnits: book.availableUnits,
            UnitPrice: book.unitPrice
        }));

        return res.status(200).json({ booksWithAvailability });
    }
];


module.exports = {
    addNewBook,
    searchBooks
};
