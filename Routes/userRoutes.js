import express from 'express';
import { createUser, getAllUser } from '../Controllers/userController.js';

const router = express.Router();

router.post('/', createUser);
router.get('/all', getAllUser);

export default router;

