import { Router } from 'express';
import multer from 'multer';
import {
    listUsers,
    getProfile,
    updateUser,
    deleteUser,
    updateProfile,
    updatePassword,
    completeProfile,
    updateAvatar
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Configure multer for memory storage (for avatar uploads)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024  // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Profile routes
router.get('/me', auth(true), getProfile);
router.put('/profile', auth(true), updateProfile);
router.put('/password', auth(true), updatePassword);
router.put('/complete-profile', auth(true), completeProfile);
router.put('/avatar', auth(true), upload.single('avatar'), updateAvatar);

// Admin routes
router.get('/', auth(true), listUsers);
router.put('/:id', auth(true), updateUser);
router.delete('/:id', auth(true), deleteUser);

export default router;
