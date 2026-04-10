import express from 'express';
const router = express.Router();
import AuthController from '../controllers/auth.controllers.js';

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.delete('/delete', AuthController.deleteUser);

export default router;