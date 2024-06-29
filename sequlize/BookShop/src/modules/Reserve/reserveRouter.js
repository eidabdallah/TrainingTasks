import { Router } from 'express';
import * as ReserveController from './reserveController.js';

const router = Router();

router.post('/bookDetails', ReserveController.bookDetails);
router.post('/buyerDetails', ReserveController.buyerDetails);
router.post('/paymentDetails', ReserveController.paymentDetails);
router.get('/getBookDetailsPage', ReserveController.getBookDetailsPage);
router.get('/getPaymentDetailsPage/:reserveId', ReserveController.getPaymentDetailsPage);



export default router;
