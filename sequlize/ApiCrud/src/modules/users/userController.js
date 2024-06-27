import userModel from "../../../DB/model/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAll();
        if (users.length === 0) {
            return res.json({ message: "no users found" });
        }
        return res.json({ message: "all User", alluser: users });
    } catch (error) {
        return res.json({ message: "error", error: error.stack });
    }
}
export const CreateUser = async (req, res) => {
    try {
        const { email, password, userName, age } = req.body;
        const user = await userModel.create({ email, password, userName, age });
        return res.json({ message: "Create Successfully", user });

    } catch (error) {
        if (error.original?.errno == 1062) {
            return res.json({ message: "email already exists" });
        }
        return res.json({ message: "error", Theerror: error.stack });
    }
}
export const DeleteUser = async (req, res) => {

    const { id } = req.params;
    const user = await userModel.destroy({
        where: { id }
    });
    if (!user) {
        return res.json({ message: "user not found" });
    }
    return res.json({ message: "delete Successfully" });
}
export const UpdateUser = async (req, res) => {

    try {
        const { id } = req.params;
        const { userName } = req.body;

        const [checkUser] = await userModel.update({ userName }, { where: { id } });
        if (checkUser === 0) {
            return res.json({ message: "user not found" });
        }
        return res.json({ message: "update Successfully" });

    } catch (error) {
        return res.json({ message: "error", error: error.stack });
    }
}
export const getOneUser = async (req, res) => {
    const { id } = req.params;
    const user = await userModel.findOne({
        where: { id }
    });
    if (!user) {
        return res.json({ message: "user not found" });
    }
    return res.json({ user: user });
}

