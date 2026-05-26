import { Router } from 'express';
import {
    calculateFee,
    createOrder,
    verifyPayment,
    getPaymentHistory,
    getPaymentById,
    createFinalPaymentOrder,
    verifyFinalPayment
} from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Public route to calculate fee (for preview)
router.post('/calculate-fee', auth(false), calculateFee);

// Authenticated routes - Booking fee
router.post('/create-order', auth(true), createOrder);
router.post('/verify', auth(true), verifyPayment);

// Final payment routes (after delivery)
router.post('/create-final-order', auth(true), createFinalPaymentOrder);
router.post('/verify-final', auth(true), verifyFinalPayment);

// Payment history & details
router.get('/history', auth(true), getPaymentHistory);
router.get('/:id', auth(true), getPaymentById);

export default router;
