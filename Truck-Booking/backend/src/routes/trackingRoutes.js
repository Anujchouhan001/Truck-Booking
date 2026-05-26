import { Router } from 'express';
import { addTrackingEvent, listTrackingEvents } from '../controllers/trackingController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.post('/', auth(true), addTrackingEvent); // Future: restrict to driver/admin
router.get('/:bookingId', auth(true), listTrackingEvents);
export default router;
