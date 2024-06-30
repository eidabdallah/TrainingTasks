const knex = require('../../db/knex.js');

const getAllPublishers = async (req, res) => {
    try {
        const publishers = await knex('publishers').select('publisherName');
        const publisherNames = publishers.map(publisher => publisher.publisherName);

        return res.status(200).json({ publisherNames });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching publishers', error });
    }
};

const addPublisher = async (req, res) => {
    try {
        const { publisherName, establishDate, isStillWorking } = req.body;

        // Parse establishDate to ensure it's in the correct format (YYYY-MM-DD)
        const parsedEstablishDate = new Date(establishDate).toISOString().split('T')[0];

        const existingPublisher = await knex('publishers').where('publisherName', publisherName).first();
        if (existingPublisher) {
            return res.status(400).json({ message: "Publisher already exists." });
        }

        await knex('publishers').insert({ publisherName, establishDate: parsedEstablishDate, isStillWorking });

        return res.status(201).json({ message: "Publisher added successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding publisher', error });
    }
};


module.exports = {
    getAllPublishers,
    addPublisher
};
