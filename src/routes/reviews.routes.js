import express from "express";
import prisma from "../PrismaClient.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// GET all reviews
router.get("/", async (req, res) => {
  const reviews = await prisma.review.findMany();
  res.status(200).json(reviews);
});


// GET review by ID
router.get("/:id", async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: req.params.id }
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  res.status(200).json(review);
});


// CREATE review
router.post("/", auth, async (req, res) => {
  const { rating, comment, userId, propertyId } = req.body;

  if (!rating || !comment || !userId || !propertyId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId,
      propertyId
    }
  });

  res.status(201).json(review);
});


// UPDATE review
router.put("/:id", auth, async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: req.params.id }
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: {
      rating: req.body.rating,
      comment: req.body.comment
    }
  });

  res.status(200).json(updated);
});


// DELETE review
router.delete("/:id", auth, async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: req.params.id }
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  await prisma.review.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({ message: "Review deleted" });
});

export default router;