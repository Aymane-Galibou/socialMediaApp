import jwt from "jsonwebtoken";

export const generateToken = async ({ payload, signature, option = {} }) => {
  return jwt.sign(payload, signature, option);
};
