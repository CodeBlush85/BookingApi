import express from "express";
import prisma from "../PrismaClient.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// GET all properties
router.get("/", async (req, res) => {
  try {
    const { location, pricePerNight } = req.query;

   const properties = await prisma.property.findMany({
  where: {
    ...(location && { location }),
    ...(pricePerNight && { pricePerNight: Number(pricePerNight) })
  },
});

    if ((location || pricePerNight) && properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    const result = properties.map(p => ({
      ...p,
      maxGuestCount: 0
    }));

    res.status(200).json(result);

  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
});


// GET property by ID
router.get("/:id", async (req, res) => {
  try {
 const property = await prisma.property.findUnique({
  where: { id: req.params.id },
});

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      ...property,
      maxGuestCount: 0
    });

  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
});


// CREATE property
router.post("/", auth, async (req, res) => {
  try {
    const { title, location, pricePerNight, hostId } = req.body;

    if (!title || !location || !pricePerNight || !hostId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const property = await prisma.property.create({
      data: {
        title,
        location,
        pricePerNight: Number(pricePerNight),
        hostId
      }
    });

    res.status(201).json(property);

  } catch {
    res.status(500).json({ message: "Creation failed" });
  }
});


// UPDATE property
router.put("/:id", auth, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        location: req.body.location,
        pricePerNight: req.body.pricePerNight
          ? Number(req.body.pricePerNight)
          : undefined
      }
    });

    res.status(200).json(updated);

  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});


// DELETE property
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await prisma.property.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({ message: "Property deleted" });

  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;