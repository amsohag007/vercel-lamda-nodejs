const express = require('express');
const serverless = require('serverless-http');
const swaggerDocument = require('./swagger');

const app = express();

app.use(express.json());

// Set up Swagger
swaggerDocument(app);

// Dummy root route
app.get('/', (req, res) => {
  res.send('Welcome to Vercel Serverless API Functions');
});

// API routes
app.use('/api/signup', require('./api/signup'));
app.use('/api/request-reset-password', require('./api/request-reset-password'));
// Add more routes as needed

module.exports = app;