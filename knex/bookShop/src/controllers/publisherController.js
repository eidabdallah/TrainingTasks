const knex = require('../../db/knex.js');
const { body, validationResult } = require('express-validator');

const getAllPublishers = async (req, res) => {
    try {
        const publishers = await knex('publishers').select('publisherName');
        const publisherNames = publishers.map(publisher => publisher.publisherName);

        return res.status(200).json({ publisherNames });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching publishers', error });
    }
};

const addPublisher = [
    body('publisherName').notEmpty().withMessage('Publisher name is required'),
    body('isStillWorking').notEmpty().withMessage('isStillWorking is required').isBoolean().withMessage('Is still working must be a boolean value'),
    body('establishDate').notEmpty().withMessage('Publish date is required').isISO8601().withMessage('Establish date must be a valid date (YYYY-MM-DD)'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { publisherName, establishDate, isStillWorking } = req.body;


        const existingPublisher = await knex('publishers').where('publisherName', publisherName).first();
        if (existingPublisher) {
            return res.status(400).json({ message: "Publisher already exists." });
        }

        // Insert new publisher
        await knex('publishers').insert({ publisherName, establishDate, isStillWorking });

        return res.status(201).json({ message: "Publisher added successfully" });
    }
];



module.exports = {
    getAllPublishers,
    addPublisher
};
