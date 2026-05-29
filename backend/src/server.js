import dotenv from "dotenv";
import express from "express"
import path from "path";
import { fileURLToPath } from "url";
import AuthRoutes from "./routes/auth.route.js"
import UserRoutes from "./routes/user.route.js"
import ChatRoutes from "./routes/chat.route.js"
import NotificationRoutes from "./routes/notification.route.js"
import WebhookRoutes from "./routes/webhook.route.js"
import { connectDB } from "./lib/db.js";
import mongoose from "mongoose";
import "./lib/passport.js";
import { verifyEmailConfig } from "./lib/email.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dns from "dns";

dns.setServers(['4.4.4.4','8.8.8.8']);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://api.dicebear.com", "https://*.stream-io-cdn.com", "https://flagcdn.com", "https://media.tenor.com", "https://*.giphy.com"],
      connectSrc: ["'self'", "https://*.stream-io-cdn.com", "wss://*.stream-io-cdn.com", "https://*.stream-io-api.com", "wss://*.stream-io-api.com", "https://*.stream-io-video.com", "wss://*.stream-io-video.com", "https://chat.stream-io-api.com", "wss://chat.stream-io-api.com", ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://*.stream-io-cdn.com"],
      workerSrc: ["'self'", "blob:"],
      frameSrc: ["'self'", "https://*.stream-io-cdn.com"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/webhooks", WebhookRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const startServer = async () => {
  try {
    await connectDB();
    await verifyEmailConfig();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed.");
        mongoose.connection.close(false).then(() => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
      setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();