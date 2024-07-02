const express = require('express');
const ReserveController = require('../controllers/reserveController.js');

const router = express.Router();

router.post('/reserveBooking', ReserveController.reserveBooking);
router.get('/getBookDetailsPage', ReserveController.getBookDetailsPage);
router.get('/getPaymentDetailsPage', ReserveController.getPaymentDetailsPage);

module.exports = router;
