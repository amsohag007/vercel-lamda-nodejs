// api/swagger.js
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Vercel Serverless API",
      version: "1.0.0",
      description: "API documentation for Vercel serverless functions",
    },
    servers: [
      {
        url: "https://vercel-lamda-nodejs.vercel.app/api",
      },
    ],
  },
  apis: ["./api/*.js"], // Adjust the path as necessary
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const router = express.Router();

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
  customCssUrl: CSS_URL,
}));

export default router;
