import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

export const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};
