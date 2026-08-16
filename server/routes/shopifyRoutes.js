import express from 'express';
import { getShopInfo } from '../controllers/shopifyController.js';

const router = express.Router();

router.get('/', getShopInfo);

export default router;
