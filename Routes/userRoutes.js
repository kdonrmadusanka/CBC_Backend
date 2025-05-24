import express from 'express';
import { createUser, getAllUser, userLogin, deleteUser, getUserById, userLogout } from '../Controllers/userController.js';
import checkRole from '../Middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', createUser);
router.get('/all', checkRole('admin'), getAllUser);
router.post('/login', userLogin);
router.post('/logout', userLogout);
router.delete('/:id', checkRole('admin'), deleteUser);
router.get('/:id', checkRole('admin'), getUserById);


export default router;

