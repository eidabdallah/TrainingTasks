import { Router } from 'express';
import * as authorController from './authorController.js';
const router = Router();



router.get('/getAllAuthors', authorController.getAllAuthors);
router.post('/addAuthors', authorController.addAuthors);

export default router;