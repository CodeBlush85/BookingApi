import express from "express";
import prisma from "../PrismaClient.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// GET all hosts OR search by name
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;

    const hosts = await prisma.host.findMany({
      where: {
        ...(name && { name })
      }
    });

    res.status(200).json(hosts);

  } catch (error) {
    res.status(500).json({
      message: "An error occurred on the server, please double-check your request!"
    });
  }
});


// GET host by ID
router.get("/:id", async (req, res) => {
  try {
    const host = await prisma.host.findUnique({
      where: { id: req.params.id }
    });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    res.status(200).json(host);

  } catch (error) {
    res.status(500).json({
      message: "An error occurred on the server, please double-check your request!"
    });
  }
});

// CREATE host
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if host already exists
    const existingHost = await prisma.host.findFirst({
      where: { name }
    });

   if (existingHost) {
  return res.status(201).json(existingHost);
}

    const host = await prisma.host.create({
      data: { name }
    });

    res.status(201).json(host);

  } catch (error) {
    res.status(500).json({
      message: "Failed to create host"
    });
  }
});


// UPDATE host
router.put("/:id", auth, async (req, res) => {
  try {
    const host = await prisma.host.findUnique({
      where: { id: req.params.id }
    });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

   const updatedHost = await prisma.host.update({
  where: { id: req.params.id },
  data: {
    name: req.body.name ?? host.name
  }
});

    res.status(200).json(updatedHost);

  } catch (error) {
    res.status(500).json({
      message: "Failed to update host"
    });
  }
});


// DELETE host
router.delete("/:id", auth, async (req, res) => {
  try {
    const host = await prisma.host.findUnique({
      where: { id: req.params.id }
    });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    await prisma.host.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({ message: "Host deleted" });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete host"
    });
  }
});


export default router;

