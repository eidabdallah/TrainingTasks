import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import tokenModel from '../DB/model/tokenModel.js';

export const verifyToken = async (req, res, next) => {
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

        const dbToken = await tokenModel.findOne({ where: { UserId: decoded.UserId } });

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
