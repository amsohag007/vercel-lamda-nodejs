import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const app = express();
// CDN CSS

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Vercel Serverless API",
      version: "1.0.0",
      description: "API documentation for Vercel serverless functions",
      contact: {
        name: "Developer",
        url: "https://yourwebsite.com",
        email: "developer@yourwebsite.com",
      },
    },
    servers: [
      {
        url: "https://vercel-lamda-nodejs.vercel.app/api",
      },
    ],
  },
  apis: ["./api/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss:
    '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
  customCssUrl: CSS_URL,
}));

export default function handler(req, res) {
  if (!req.url.startsWith("/api-docs")) {
    return res.status(404).send("Not Found");
  }

  app(req, res);
}