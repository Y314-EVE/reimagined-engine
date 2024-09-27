import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const secret = process.env.JWTSECRET;

export const signToken = (
  payload: { _id: string; name: string },
  expireTime: string,
) => {
  if (!secret) {
    console.error("JWT secret not configure");
    process.exit(1);
  }
  return jwt.sign(payload, secret, { expiresIn: expireTime });
};

export const verifyToken = (payload: string) => {
  if (!secret) {
    console.error("JWT secret not configure");
    process.exit(1);
  }
  return jwt.verify(payload, secret);
};
