import { Router } from 'express';
import * as UserController from './userController.js';
const router = Router();

router.get('/getAllUser', UserController.getAllUsers);
router.get('/getOneUser/:id', UserController.getOneUser);
router.post('/CreateUser', UserController.CreateUser);
router.delete('/DeleteUser/:id', UserController.DeleteUser);
router.patch('/UpdateUser/:id', UserController.UpdateUser);

export default router;

