// app.js
import dotenv from 'dotenv';
import express from 'express';
import swaggerRouter from './api/swagger';
import signupRouter from './api/signup'; // Ensure this file uses ES6 export
// import requestResetPasswordRouter from './api/request-reset-password'; // Ensure this file uses ES6 export

dotenv.config();
const app = express();
app.use(express.json());

// Set up Swagger
app.use('/api-docs', swaggerRouter);

// Dummy root route
app.get('/', (req, res) => {
  res.send('Welcome to Vercel Serverless API Functions');
});

// API routes
app.use('/api/signup', signupRouter);
app.use('/api/request-reset-password', requestResetPasswordRouter);

export default app; // Ensure that app is exported correctly
