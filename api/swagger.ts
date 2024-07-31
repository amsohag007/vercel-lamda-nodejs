import swaggerJsDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express, { Router } from "express";

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Income Path Serverless API",
      version: "1.0.0",
      description: "API documentation for Income Path Serverless Functions",
    },
    servers: [
      {
        url: "https://income-path-be.vercel.app",
      },
    ],
  },
  apis: ["./api/*.ts"], // Adjust the path to your API files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const router: Router = express.Router();

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, { customCssUrl: CSS_URL }));

export default router;