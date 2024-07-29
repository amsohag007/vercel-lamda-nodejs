import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import bodyParser from "body-parser";


// CDN CSS

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const app = express();

app.use(bodyParser.json()); // to use body object in requests
const PORT = 3000;
dotenv.config();

app.use(morgan("dev"));
app.use(cors());

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

const specs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(specs, { customCssUrl: CSS_URL })
);

// Use the router from the post.js file
app.use("/api/sign-up", './api/signup.js');
app.use("/api/login", './api/login.js');

app.listen(PORT, () => console.log(`Server runs on port ${PORT}`));