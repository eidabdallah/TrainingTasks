const knex = require('../../db/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const register = async (req, res) => {
    try {
        const { email, password, name, age } = req.body;

        // Validation
        if (!validator.isEmail(email)) {
            return res.json({ message: "Invalid email format" });
        }
        if (password.length < 10) {
            return res.json({ message: "Password must be at least 10 characters long" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email already exists
        const checkEmailUser = await knex('users').where({ email }).first();
        if (checkEmailUser) {
            return res.json({ message: "Email already exists" });
        }

        // Create new user
        const newUser = {
            email,
            password: hashedPassword,
            name,
            age
        };
        const [userId] = await knex('users').insert(newUser);

        // Generate token
        const token = await generateToken(userId);

        return res.json({ message: "Registered successfully", token });
    } catch (error) {
        return res.json({ message: "Error", error: error.stack });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await knex('users').where({ email }).first();
        if (!user) {
            return res.json({ message: "Email not found" });
        }
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ message: "Password is wrong" });
        }
        // Generate token
        const token = await generateToken(user.id);

        return res.json({ message: "Login Successfully", token });
    } catch (error) {
        return res.json({ message: "Error", error: error.stack });
    }
};

const generateToken = async (userId) => {
    try {
        const token = jwt.sign({ UserId: userId }, 'Asal_Training_2024!#', { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600000);

        // Store hashed token in the database
        const hashedToken = await bcrypt.hash(token, 10);
        const existingToken = await knex('tokens').where({ user_id: userId }).first();

        if (existingToken) {
            await knex('tokens').where({ user_id: userId }).update({
                token: hashedToken,
                expiresAt
            });
        } else {
            await knex('tokens').insert({
                token: hashedToken,
                expiresAt,
                user_id: userId
            });
        }

        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

const logout = async (req, res) => {
    try {
        const { id } = req.body;

        // Find token by user ID
        const token = await knex('tokens').where({ user_id: id }).first();
        if (!token) {
            return res.status(404).json({ message: "Token not found" });
        }

        // Delete token from database
        await knex('tokens').where({ user_id: id }).del();

        return res.json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

module.exports = {
    register,
    login,
    generateToken,
    logout,
};
