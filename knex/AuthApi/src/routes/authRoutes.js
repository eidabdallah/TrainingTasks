const express = require('express');
const authController = require('../controllers/authController.js');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware.js');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/logout', verifyToken, authController.logout);


module.exports = router;
