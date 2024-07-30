// app.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerRouter from './api/swagger';
import signupRouter from './api/signup';
import loginRouter from './api/login';
import requestResetPasswordRouter from './api/request-reset-password';
import resetPasswordRouter from './api/reset-password';

dotenv.config();
const app = express();
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000/', // Adjust this to your front-end URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Set up Swagger
app.use('/api-docs', swaggerRouter);

// Dummy root route
app.get('/', (req, res) => {
  res.send('Welcome to Vercel Serverless API Functions');
});

// API routes
app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/request-reset-password', requestResetPasswordRouter);
app.use('/api/reset-password', resetPasswordRouter);

export default app; // Ensure that app is exported correctly
