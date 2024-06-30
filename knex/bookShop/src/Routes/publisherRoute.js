const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisherController.js');


router.get('/getAllPublishers', publisherController.getAllPublishers);
router.post('/addPublisher', publisherController.addPublisher);

module.exports = router;
