// CliniQ AI — Intake API Routes
import { Router } from 'express';
import { handleIntake } from '../controllers/intakeController.js';

const router = Router();

// POST /api/intake — Process patient intake through AI
router.post('/intake', handleIntake);

// GET /api/health — Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'CliniQ AI Backend',
        timestamp: new Date().toISOString()
    });
});

export default router;
