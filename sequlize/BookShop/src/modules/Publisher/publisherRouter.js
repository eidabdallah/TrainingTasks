import { Router } from 'express';
import * as publisherController from './publisherController.js';

const router = Router();

router.get('/getAllPublishers', publisherController.getAllPublishers);
router.post('/addPublisher', publisherController.addPublisher);

export default router;