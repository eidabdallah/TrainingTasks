import userModel from "../../../DB/model/userModel.js";
import tokenModel from "../../../DB/model/tokenModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';



export const register = async (req, res) => {
    try {
        const { email, password, userName, age } = req.body;
        // validation : 
        if (!validator.isEmail(email)) {
            return res.json({ message: "Invalid email format" });
        }
        if (password.length < 10) {
            return res.json({ message: "Password must be at least 10 characters long" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email already exists
        const checkEmailUser = await userModel.findOne({ where: { email } });
        if (checkEmailUser) {
            return res.json({ message: "Email already exists" });
        }

        // Create new user
        const user = await userModel.create({ email, password: hashedPassword, userName, age });
        const token = await generateToken(user.id);
        return res.json({ message: "Registered successfully", token: token });

    } catch (error) {
        return res.json({ message: "Error", error: error.stack });
    }
}
export const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await userModel.findOne({
        attributes: ["id", "email", "password"],
        where: { email }
    });
    if (!user) {
        return res.json({ message: "email not available" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.json({ message: "password is wrong" });
    }

    const token = await generateToken(user.id);

    return res.json({ message: "Login Successfully", token: token });
}
const generateToken = async (id) => {
    try {
        const token = jwt.sign({ UserId: id }, 'Asal_Training_2024!#', { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600000);

        const hashedToken = await bcrypt.hash(token, 10);

        const existingToken = await tokenModel.findOne({ where: { UserId: id } });
        if (existingToken) {
            await existingToken.update({
                token: hashedToken,
                expiresAt: expiresAt
            });
        } else {
            await tokenModel.create({
                token: hashedToken,
                expiresAt: expiresAt,
                UserId: id
            });
        }
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
    }
};
export const logout = async (req, res) => {
    try {
        const { id } = req.body;
        const token = await tokenModel.findOne({ where: { UserId: id } });
        if (!token) {
            return res.status(404).json({ message: "Token not found" });
        }
        await token.destroy();
        return res.json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging out", error: error.message });
    }
};