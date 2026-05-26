import { Router } from 'express';
import { createBookingHandler, listMyBookings } from '../controllers/bookingController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.post('/', auth(true), createBookingHandler);
router.get('/', auth(true), listMyBookings);
export default router;
