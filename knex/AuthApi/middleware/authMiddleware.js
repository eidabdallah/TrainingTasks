const knex = require('../db/knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(403).json({ message: "Token is required" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(403).json({ message: "Token is required" });
        }

        const decoded = jwt.verify(token, 'Asal_Training_2024!#');

        const dbToken = await knex('tokens').where({ user_id: decoded.UserId }).first();

        if (!dbToken) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const isMatch = await bcrypt.compare(token, dbToken.token);

        if (!isMatch) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = { id: decoded.UserId };
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token", error: error.message });
    }
};

module.exports = verifyToken;
