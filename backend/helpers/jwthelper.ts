import jwt, { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";

const secret =
  "6993b1e71601a070ae1a98ebf4e7b45f08458d52a9a445f0262111f745ae2829";

export const signToken = (
  payload: { _id: string; name: string },
  expireTime: string,
) => {
  return jwt.sign(payload, secret, { expiresIn: expireTime });
};

export const verifyToken = (payload: string) => {
  return jwt.verify(payload, secret);
};
