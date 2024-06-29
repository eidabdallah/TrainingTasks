import publisherModel from "../../../DB/model/publisherModel.js";

export const getAllPublishers = async (req, res) => {
    try {
        const publishers = await publisherModel.findAll({
            attributes: ['publisherName']
        });
        const publisherNames = publishers.map(publisher => publisher.publisherName);

        return res.status(200).json({ publisherNames });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching publishers', error });
    }
};
export const addPublisher = async (req, res) => {
    try {
        const { publisherName, establishDate, isStillWorking } = req.body;
        const existingPublisher = await publisherModel.findOne({ where: { publisherName } });

        if (existingPublisher) { return res.status(400).json({ message: "Publisher already exists." }); }
        const newPublisher = await publisherModel.create({ publisherName, establishDate, isStillWorking });

        return res.status(201).json({ message: "Publisher added successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding publisher', error });
    }
};
