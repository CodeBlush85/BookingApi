import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return next();
  }

  const token = header.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

  next();
}