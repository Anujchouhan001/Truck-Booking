import { Router } from 'express';
import { listTrucks, createTruck, updateTruck, deleteTruck } from '../controllers/truckController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/', auth(true), listTrucks);
router.post('/', auth(true), createTruck);
router.put('/:id', auth(true), updateTruck);
router.delete('/:id', auth(true), deleteTruck);
export default router;
