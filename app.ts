import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerRouter from './api/swagger';
import signupRouter from './api/signup';
import loginRouter from './api/login';
import requestResetPasswordRouter from './api/request-reset-password';
import resetPasswordRouter from './api/reset-password';
import accountSettingsRouter from './api/settings';

dotenv.config();
const app = express();
app.use(express.json());

// Configure CORS
const corsOptions: cors.CorsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));

// Set up Swagger
app.use('/api-docs', swaggerRouter);

// Dummy root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Vercel Serverless API Functions');
});

// API routes
app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/request-reset-password', requestResetPasswordRouter);
app.use('/api/reset-password', resetPasswordRouter);
app.use('/api/settings', accountSettingsRouter);

export default app; // Ensure that app is exported correctly