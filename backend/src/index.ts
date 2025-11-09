import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/v1/auth.routes";
import userRoutes from "./routes/v1/users.routes";
import matchRoutes from "./routes/v1/matches.routes";
import sessionRoutes from "./routes/v1/session.routes";
import messageRoutes from "./routes/v1/messages.routes";
import http from "http";
import { initSocket } from "./socket";

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json()); // Parses incoming JSON bodies

// Routes
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "SkillSwap API is working" });
});

// auth: /Register and /Login
app.use("/api/v1/auth", authRoutes);

// users: /me
app.use("/api/v1/users", userRoutes);

// matches
app.use("/api/v1/matches", matchRoutes);

// Sessions: Create, Get and UpdateStatus
app.use("/api/v1/sessions", sessionRoutes);

// Messages
app.use("/api/v1/messages", messageRoutes);

// Initializing Socket Server
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

// Listen only once using the HTTP server (Express + Socket.IO)
const startServer = async () => {
  await connectDB(); // Connect and strictly wait for MongoDB
  server.listen(PORT, () => {
    console.log(`API and Socket listening on http://localhost:${PORT}`);
  });
};
startServer();
