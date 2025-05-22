import express from 'express';
import { createUser, getAllUser, userLogin, deleteUser } from '../Controllers/userController.js';
import checkRole from '../Middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', createUser);
router.get('/all', checkRole('admin'), getAllUser);
router.post('/login', userLogin);
router.delete('/:id', checkRole('admin'), deleteUser);


export default router;

