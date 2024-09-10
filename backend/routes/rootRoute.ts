import express from "express";
import promptRoute from "./";

const route = (app: express.Application) => {
  app.use("/api", promptRoute);
};

export default route;
