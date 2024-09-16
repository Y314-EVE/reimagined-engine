import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../helpers";

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) req.params.user = verifyToken(token).toString();
    next();
  } catch (err) {
    res.status(400).send("Authentication failed.");
  }
};
export default auth;
