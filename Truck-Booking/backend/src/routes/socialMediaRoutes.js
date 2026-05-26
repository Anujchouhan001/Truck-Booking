import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllSocialMedia,
  getAllSocialMediaAdmin,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia
} from '../controllers/socialMediaController.js';

const router = Router();

// Public route - get active social media links
router.get('/', getAllSocialMedia);

// Admin route - get all social media links (including inactive)
router.get('/admin', auth(true), getAllSocialMediaAdmin);

// SuperAdmin routes
router.post('/', auth(true), createSocialMedia);
router.put('/:id', auth(true), updateSocialMedia);
router.delete('/:id', auth(true), deleteSocialMedia);

export default router;
