import express from "express";
import { promptRoute, authRoute } from "./";

const route = (app: express.Application) => {
  app.use("/api", promptRoute);
  app.use("/api", authRoute);
};

export default route;
