const express = require('express');
const userController = require('../controllers/userController.js');
const router = express.Router();


router.get('/getAllUser', userController.getAllUsers);
router.get('/getOneUser/:id', userController.getOneUser);
router.post('/CreateUser', userController.CreateUser);
router.delete('/DeleteUser/:id', userController.DeleteUser);
router.patch('/UpdateUser/:id', userController.UpdateUser);

module.exports = router;
