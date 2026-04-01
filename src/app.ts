import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import authRoutes from './routes/auth.routes';
import recordRoutes from './routes/record.routes';
import dashboardRoutes from './routes/dashboard.routes';
import logger from './utils/logger';

const app = express();

// Trust Cloud Run's proxy (required for rate-limiting)
app.set('trust proxy', 1);

// Standard Middlewares
app.use(securityMiddleware); // Helmet
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
