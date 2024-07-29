import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const app = express();

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
        url: "https://your-vercel-url.vercel.app/api",
      },
    ],
  },
  apis: ["./api/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default function handler(req, res) {
  if (!req.url.startsWith("/api-docs")) {
    return res.status(404).send("Not Found");
  }

  app(req, res);
}
