const express = require('express');
const authorController = require('../controllers/authorController.js');

const router = express.Router();

router.get('/getAllAuthors', authorController.getAllAuthors);
router.post('/addAuthors', authorController.addAuthors);

module.exports = router;
