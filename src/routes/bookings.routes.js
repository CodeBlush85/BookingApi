import express from "express";
import prisma from "../PrismaClient.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// GET all bookings
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

 const bookings = await prisma.booking.findMany({
  where: {
    ...(userId && { userId })
  },
});

    if (userId && bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);

  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
});


// GET booking by ID
router.get("/:id", async (req, res) => {
  try {
 const booking = await prisma.booking.findUnique({
  where: { id: req.params.id },
});

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);

  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
});


// CREATE booking
router.post("/", auth, async (req, res) => {
  try {
    const { userId, propertyId, totalPrice } = req.body;

    if (!userId || !propertyId || !totalPrice) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId,
        totalPrice: Number(totalPrice)
      }
    });

    res.status(201).json(booking);

  } catch {
    res.status(500).json({ message: "Booking creation failed" });
  }
});


// UPDATE booking
router.put("/:id", auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        totalPrice: req.body.totalPrice
          ? Number(req.body.totalPrice)
          : undefined
      }
    });

    res.status(200).json(updated);

  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});


// DELETE booking
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await prisma.booking.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({ message: "Booking deleted" });

  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;