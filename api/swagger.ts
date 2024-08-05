import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import path from "path";
const glob = require('glob'); // CommonJS import

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// Use glob to include .ts and .js files only, excluding directories
const filePatterns = glob.sync(path.join(__dirname, '../api/**/*.{ts,js}'), { nodir: true });
console.log("filePatterns", filePatterns); // Add this line to check the matched file paths

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Income Path Serverless API",
      version: "1.0.0",
      description: "API documentation for Income Path Serverless Functions",
    },
    servers: [
      {
        url: "https://vercel-lamda-nodejs.vercel.app",
      },
      {
        url: "https://income-path-be.vercel.app",
      },
    ],
  },
  apis: filePatterns,
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const router = express.Router();

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
  customCssUrl: CSS_URL,
}));

export default router;
