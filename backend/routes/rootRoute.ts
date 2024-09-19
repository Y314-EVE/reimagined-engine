import express, { Request, Response } from "express";
import { promptRoute, authRoute } from "./";

const route = (app: express.Application) => {
  app.use("/api", promptRoute);
  app.use("/api", authRoute);
  app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ code: 404, message: "Route not exist" });
  });
};

export default route;
