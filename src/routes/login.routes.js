import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../PrismaClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.AUTH_SECRET_KEY
    );

    return res.status(200).json({ token });

  } catch (error) {
    return res.status(500).json({
      message: "An error occurred on the server, please double-check your request!"
    });
  }
});

export default router;