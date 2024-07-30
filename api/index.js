import express from "express";
import app from "../app"; // Adjust the path as necessary

const server = express();

server.use((req, res) => {
  if (!req.url.startsWith("/api-docs")) {
    return res.status(404).send("Not Found");
  }

  app(req, res);
});

export default server;
