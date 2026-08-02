// CliniQ AI — Express Backend Server
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import intakeRoutes from './routes/intakeRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', intakeRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'CliniQ AI Backend',
        version: '1.0.0',
        endpoints: {
            intake: 'POST /api/intake',
            health: 'GET /api/health'
        }
    });
});

// Start server if run directly
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`\n🏥 CliniQ AI Backend running on http://localhost:${PORT}`);
        console.log(`   POST http://localhost:${PORT}/api/intake`);
        console.log(`   GET  http://localhost:${PORT}/api/health\n`);
    });
}

export default app;
