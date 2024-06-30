const knex = require('../../db/knex.js');

const getAllAuthors = async (req, res) => {
    try {
        const authors = await knex('authors').select('firstName', 'middleName', 'lastName');

        const authorNames = authors.map(author => {
            const { firstName, middleName, lastName } = author;
            return `${firstName} ${middleName}${lastName}`;
        });

        return res.status(200).json({ authorNames });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching authors', error });
    }
};

const addAuthors = async (req, res) => {
    try {
        const { firstName, middleName, lastName, birthDate, countryOfResidence, deathDate, officialWebsite } = req.body;

        const existingAuthor = await knex('authors').where({ firstName, middleName, lastName }).first();
        if (existingAuthor) {
            return res.status(400).json({ message: "Author already exists." });
        }

        await knex('authors').insert({
            firstName, middleName, lastName, birthDate, countryOfResidence, deathDate, officialWebsite
        });

        return res.status(201).json({ message: "Author added successfully" });
    } catch (error) {
        console.error("Error adding author:", error);
        return res.status(500).json({ message: 'Error adding author', error });
    }
};

module.exports = {
    getAllAuthors,
    addAuthors
};
