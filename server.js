import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { createCorsConfig, corsErrorHeaders, getAllowedOrigins } from "./config/cors.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import charityRoutes from "./routes/charityRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import drawRoutes from "./routes/drawRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors(createCorsConfig()));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/charity", charityRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/winner", winnerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donation", donationRoutes);

app.get("/", (req, res) => {
  res.send("API Running ...");
});

app.use((err, req, res, next) => {
  console.error(err);
  const headers = corsErrorHeaders(req);
  res.set(headers);
  res.status(err.status || 500).json({ msg: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server on port ${PORT}`);
  console.log("CORS allowed origins:", [...getAllowedOrigins()].join(", ") || "(none)");
  if (!process.env.JWT_SECRET) console.warn("JWT_SECRET is not set");
});
