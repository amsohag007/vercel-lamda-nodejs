const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger');

const app = express();

app.use(express.json());

// Set up Swagger
swaggerDocument(app);

// Dummy root route
app.get('/', (req, res) => {
  res.send('Welcome to Vercel Serverless API Functions');
});

// API routes
app.use('/api/signup', require('./signup'));
app.use('/api/request-reset-password', require('./request-reset-password'));
app.use('/api/reset-password', require('./reset-password'));

module.exports = app; // Ensure that app is exported correctly
