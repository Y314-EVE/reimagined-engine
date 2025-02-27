import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../helpers";
import TokenPair from "../models/TokenPair";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) req.user = verifyToken(token);
    if (typeof req.user !== "string") {
      const { _id } = req.user;
      const accessToken = await TokenPair.findOne({
        user: _id,
        accessToken: `Bearer ${token}`,
      }).exec();
      const refreshToken = await TokenPair.findOne({
        user: _id,
        refreshToken: `Bearer ${token}`,
      }).exec();
      const isVaildAccessToken = accessToken
        ? accessToken.expireAt > new Date(Date.now()) &&
          accessToken.invalidatedAt === null
        : false;
      const isVaildRefreshToken = refreshToken
        ? refreshToken.expireAt > new Date(Date.now()) &&
          refreshToken.invalidatedAt === null
        : false;
      const isVaildToken = isVaildAccessToken || isVaildRefreshToken;
      if (!isVaildToken) throw new Error("Invalid token");
      next();
    } else {
      res.status(400).send("Authentication failed.");
    }
  } catch (err) {
    res.status(400).send("Authentication failed.");
  }
};
export default auth;
