import { Router } from 'express';
import * as AuthController from './authController.js';
import { verifyToken } from '../../../middleware/authMiddleware.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post('/logout', verifyToken, AuthController.logout);


export default router;