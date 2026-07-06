import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import researchRouter from './routes/research.route.js';
import historyRouter from './routes/history.route.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', researchRouter);
app.use('/api', historyRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 The Deal Desk backend running on http://localhost:${PORT}`);
});
