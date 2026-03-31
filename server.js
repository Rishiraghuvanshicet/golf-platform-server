import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import charityRoutes from "./routes/charityRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import drawRoutes from "./routes/drawRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/charity", charityRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/winner", winnerRoutes);

app.get("/", (req, res) => {
  res.send("API Running ...");
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Server Error"
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(` Server running on port ${PORT}`)
);