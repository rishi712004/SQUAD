import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import "./config/passport.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import matchRoutes from "./routes/match.routes.js";
import socialRoutes from "./routes/social.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { initSockets } from "./socket/index.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ── Global middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// attach io to req so controllers can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── REST routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 handler ────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Sockets ────────────────────────────────────────────────────────
initSockets(io);

// ── Start ──────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();