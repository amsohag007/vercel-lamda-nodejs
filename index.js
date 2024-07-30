require('dotenv').config();
const express = require('express');
const swaggerDocument = require('./api/swagger');

const app = express();
app.use(express.json());

// Set up Swagger
app.use('/api-docs', swaggerDocument);

// Dummy root route
app.get('/', (req, res) => {
  res.send('Welcome to Vercel Serverless API Functions');
});

// API routes
app.use('/api/signup', require('./api/signup'));
app.use('/api/request-reset-password', require('./api/request-reset-password'));
// Add more routes as needed

module.exports = app; // Ensure that app is exported correctly
