const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Vercel Serverless API',
      version: '1.0.0',
      description: 'API documentation for Vercel serverless functions',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server'
      },
      {
        url: 'https://income-path-be.vercel.app',
        description: 'Production server'
      }
    ],
  },
  apis: ['./api/*.js'], // Files containing Swagger annotations
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};