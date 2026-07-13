import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cron from "node-cron";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";
import routes from "./routes";
import { startJobs } from "./jobs";

const app = express();

// Behind Nginx (host reverse proxy) — trust the first proxy hop so req.ip and
// X-Forwarded-For reflect the real client (needed for rate limiting & logs).
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.use("/api", routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

// Global error handler — must be 4-arg to be recognized by Express
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[unhandled error]", err);
  res.status(err.status || 500).json({ error: true, message: err.message || "Internal server error" });
});

let server: ReturnType<typeof app.listen>;

const start = async () => {
  await connectDatabase();
  await connectRedis();
  startJobs();
  server = app.listen(env.port, () => {
    console.log(`AI Pastor running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start();

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[${signal}] Shutting down gracefully...`);

  // 1. Stop cron jobs so nothing new kicks off mid-shutdown
  cron.getTasks().forEach((task) => task.stop());

  // 2. Stop accepting new HTTP connections, drain in-flight requests
  await new Promise<void>((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
  });

  // 3. Close external connections
  try {
    await disconnectRedis();
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error during shutdown:", err);
  }

  console.log("Shutdown complete.");
  process.exit(0);
};

// Docker/Nginx send SIGTERM on `docker stop`; Ctrl+C sends SIGINT
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Force-exit if graceful shutdown hangs (e.g. a stuck connection)
process.on("SIGTERM", () => setTimeout(() => process.exit(1), 10000).unref());

export default app;
