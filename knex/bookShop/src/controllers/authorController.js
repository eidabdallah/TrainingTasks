const knex = require('../../db/knex.js');
const { body, validationResult } = require('express-validator');


const getAllAuthors = async (req, res) => {
    try {
        const authors = await knex('authors').select('firstName', 'middleName', 'lastName');

        if (authors.length === 0) {
            return res.status(404).json({ message: 'No authors found' });
        }

        const authorNames = authors.map(author => {
            const { firstName, middleName, lastName } = author;
            return `${firstName} ${middleName}${lastName}`;
        });

        return res.status(200).json({ authorNames });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching authors', error });
    }
};

const addAuthors = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('birthDate').notEmpty().isDate().withMessage('Birth date must be a valid date'),
    body('countryOfResidence').notEmpty().withMessage('Country of residence is required'),
    body('officialWebsite').isURL().withMessage('Official website must be a valid URL'),
    body('deathDate').optional().isDate().withMessage('Death date must be a valid date'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, middleName, lastName, birthDate, countryOfResidence, deathDate, officialWebsite } = req.body;

        const existingAuthor = await knex('authors').where({ firstName, middleName, lastName }).first();
        if (existingAuthor) {
            return res.status(400).json({ message: "Author already exists." });
        }

        await knex('authors').insert({
            firstName, middleName, lastName, birthDate, countryOfResidence, deathDate, officialWebsite
        });

        return res.status(201).json({ message: "Author added successfully" });
    }
];




module.exports = {
    getAllAuthors,
    addAuthors,
};
