import express from 'express';
import { createUser, getAllUser, userLogin } from '../Controllers/userController.js';
import checkRole from '../Middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', createUser);
router.get('/all', checkRole('admin'), getAllUser);
router.post('/login', userLogin);

export default router;

