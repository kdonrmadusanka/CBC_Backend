import express from'express';
import checkRole from '../Middleware/roleMiddleware.js';
import { createProduct } from '../Controllers/productController.js';

const router = express.Router();

router.post('/create', checkRole("admin"), createProduct);

export default router;