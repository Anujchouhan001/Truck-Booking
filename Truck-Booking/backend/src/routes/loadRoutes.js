import { Router } from 'express';
import {
    postLoad,
    listLoads,
    getLoadDetails,
    updateLoad,
    updateLoadStatus,
    cancelLoad,
    assignDriver,
    deleteLoad
} from '../controllers/loadController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Public routes (with optional auth for filtering)
router.get('/', auth(false), listLoads);

// Protected routes
router.post('/', auth(true), postLoad);
router.get('/:id', auth(true), getLoadDetails);
router.put('/:id', auth(true), updateLoad);
router.put('/:id/status', auth(true), updateLoadStatus);
router.put('/:id/cancel', auth(true), cancelLoad);
router.put('/:id/assign', auth(true), assignDriver);
router.delete('/:id', auth(true), deleteLoad);

export default router;
