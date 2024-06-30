const knex = require('../../db/knex.js');

const addNewBook = async (req, res) => {
    try {
        const { bookTitle, bookPublisher, publishDate, bookAuthor, bookTags, availableUnits, unitPrice } = req.body;
        const bookPdf = req.file ? `/${req.file.filename}` : null;
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

        const parsedPublishDate = new Date(publishDate).toISOString().split('T')[0];

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

        const newBook = await knex('books').insert({
            bookTitle,
            PublisherId: publisher.id,
            publishDate: parsedPublishDate,
            AuthorId: author.id,
            bookPdf,
            bookTags: JSON.stringify(tagsArray),
            availableUnits,
            unitPrice
        });

        return res.status(201).json({ message: "Book added successfully." });

    } catch (error) {
        console.error('Error adding book:', error);
        return res.status(500).json({ message: 'Error adding book', error: error.message });
    }
};


const searchBooks = async (req, res) => {
    try {
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

    } catch (error) {
        console.error('Error searching books:', error);
        return res.status(500).json({ message: 'Error searching books', error: error.message });
    }
};

module.exports = {
    addNewBook,
    searchBooks
};
