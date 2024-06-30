const express = require('express');
const ReserveController = require('../controllers/reserveController.js');

const router = express.Router();

router.post('/bookDetails', ReserveController.bookDetails);
router.post('/buyerDetails', ReserveController.buyerDetails);
router.post('/paymentDetails', ReserveController.paymentDetails);
router.get('/getBookDetailsPage', ReserveController.getBookDetailsPage);
router.get('/getPaymentDetailsPage/:reserveId', ReserveController.getPaymentDetailsPage);

module.exports = router;
