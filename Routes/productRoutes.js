import express from'express';
import checkRole from '../Middleware/roleMiddleware.js';
import { createProduct, getProductById } from '../Controllers/productController.js';

const router = express.Router();

router.post('/create', checkRole("admin"), createProduct);
router.get('/:id', checkRole('admin'), getProductById);

export default router;