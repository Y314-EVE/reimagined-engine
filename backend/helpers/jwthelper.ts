import jwt from "jsonwebtoken";

const secret =
  "6993b1e71601a070ae1a98ebf4e7b45f08458d52a9a445f0262111f745ae2829";

export const signToken = (payload: JSON) => {
  return jwt.sign(payload, secret, { expiresIn: "10m" });
};

export const verifyToken = (payload: string) => {
  return jwt.verify(payload, secret);
};
