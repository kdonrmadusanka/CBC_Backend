import express from'express';
import checkRole from '../Middleware/roleMiddleware.js';
import { createProduct, getProductById, updateProduct } from '../Controllers/productController.js';

const router = express.Router();

router.post('/create', checkRole("admin"), createProduct);
router.get('/:id', checkRole('admin'), getProductById);
router.put('/:id', checkRole('admin'), updateProduct);

export default router;