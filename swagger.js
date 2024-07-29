const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// CDN CSS

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

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
  apis: ['./api/*.js'], // Adjust the path to your API files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
  app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(specs, { customCssUrl: CSS_URL })
  );
};
