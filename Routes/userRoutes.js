import express from 'express';
import { createUser, getAllUser, userLogin } from '../Controllers/userController.js';

const router = express.Router();

router.post('/register', createUser);
router.get('/all', getAllUser);
router.post('/login', userLogin);

export default router;

