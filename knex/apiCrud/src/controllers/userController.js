const knex = require('../../db/knex');

const getAllUsers = async (req, res) => {
    try {
        const users = await knex('users').select('*');
        if (users.length === 0) {
            return res.json({ message: "no users found" });
        }
        return res.json({ message: "all User", alluser: users });
    } catch (error) {
        return res.json({ message: "error", error: error.stack });
    }
};

const CreateUser = async (req, res) => {
    try {
        const { email, phoneNumber, name } = req.body;
        const now = knex.fn.now();
        const user = await knex('users').insert({ email, phoneNumber, name, createdAt: now, updatedAt: now });
        return res.json({ message: "Create Successfully", user });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.json({ message: "email already exists" });
        }
        return res.json({ message: "error", Theerror: error.stack });
    }
};

const DeleteUser = async (req, res) => {
    const { id } = req.params;
    const deletedCount = await knex('users').where({ id }).del();
    if (deletedCount === 0) {
        return res.json({ message: "user not found" });
    }
    return res.json({ message: "delete Successfully" });
};

const UpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedCount = await knex('users').where({ id }).update({ name });
        if (updatedCount === 0) {
            return res.json({ message: "user not found" });
        }
        return res.json({ message: "update Successfully" });

    } catch (error) {
        return res.json({ message: "error", error: error.stack });
    }
};

const getOneUser = async (req, res) => {
    const { id } = req.params;
    const user = await knex('users').where({ id }).first();
    if (!user) {
        return res.json({ message: "user not found" });
    }
    return res.json({ user });
};

module.exports = {
    getOneUser,
    UpdateUser,
    DeleteUser,
    CreateUser,
    getAllUsers
};
