import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Authorization token required" });
  }

let token;

if (header.startsWith("Bearer ")) {
  token = header.split(" ")[1];
} else {
  token = header;
}

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET_KEY);
    req.user = decoded;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  next();
}