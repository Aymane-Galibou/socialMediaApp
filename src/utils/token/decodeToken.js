import jwt from "jsonwebtoken";

export const decodeToken =async ({ token, signature }) => {
  return jwt.verify(token, signature);
};
