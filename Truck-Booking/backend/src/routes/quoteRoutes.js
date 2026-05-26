import { Router } from 'express';
import {
    submitQuote,
    listQuotesForLoad,
    getMyQuotes,
    acceptQuote,
    rejectQuote,
    withdrawQuote
} from '../controllers/quoteController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Submit a quote
router.post('/', auth(true), submitQuote);

// Get my quotes (driver's own quotes)
router.get('/my-quotes', auth(true), getMyQuotes);

// Get quotes for a specific load
router.get('/load/:loadId', auth(true), listQuotesForLoad);

// Accept a quote
router.put('/:quoteId/accept', auth(true), acceptQuote);

// Reject a quote
router.put('/:quoteId/reject', auth(true), rejectQuote);

// Withdraw/delete a quote
router.delete('/:quoteId', auth(true), withdrawQuote);

export default router;
