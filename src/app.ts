import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import routes from "./routes";
import { startJobs } from "./jobs";

const app = express();

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

const start = async () => {
  await connectDatabase();
  await connectRedis();
  startJobs();
  app.listen(env.port, () => {
    console.log(`AI Pastor running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start();

export default app;
