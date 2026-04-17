import express from "express";
import * as Sentry from "@sentry/node";

import usersRoutes from "./routes/users.routes.js";
import propertiesRoutes from "./routes/properties.routes.js";
import hostsRoutes from "./routes/hosts.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import loginRoutes from "./routes/login.routes.js";

const app = express(); // ✅ MUST be defined BEFORE using it

// Sentry init
Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

// Sentry request handler 
app.use(Sentry.Handlers.requestHandler());

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
  });

  next();
});

// Routes
app.use("/login", loginRoutes);
app.use("/users", usersRoutes);
app.use("/hosts", hostsRoutes);
app.use("/properties", propertiesRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/reviews", reviewsRoutes);

// Sentry error handler 
app.use(Sentry.Handlers.errorHandler());

// Custom error handler 
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "An error occurred on the server, please double-check your request!"
  });
});

export default app;