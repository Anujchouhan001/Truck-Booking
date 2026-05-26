import { Router } from 'express';
import { submitInquiry, listInquiries } from '../controllers/inquiryController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.post('/', submitInquiry); // public inquiry submission
router.get('/', auth(true), listInquiries); // future: admin only
export default router;
