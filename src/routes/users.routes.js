import express from "express";
import prisma from "../PrismaClient.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all users / filter
router.get("/", async (req, res) => {
  try {
    const { username, email } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(username && { username }),
        ...(email && { email })
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if ((username || email) && users.length === 0) {
  return res.status(404).json({ message: "No users found" });
    }
    
    res.status(200).json(users);

  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// CREATE
router.post("/", auth, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

if (existingUser) {
  return res.status(201).json({
    id: existingUser.id,
    username: existingUser.username,
    email: existingUser.email
  });
}

    const user = await prisma.user.create({
      data: { username, email, password },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    res.status(201).json(user);

  } catch {
    res.status(500).json({ message: "Failed to create user" });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        username: req.body.username ?? user.username,
        email: req.body.email ?? user.email,
        password: req.body.password ?? user.password
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    res.status(200).json(updated);

  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({ message: "User deleted" });

  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;