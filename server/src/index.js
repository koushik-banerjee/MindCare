import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import { bookingRoutes } from "./routes/booking.routes.js";
import { resourceRoutes } from "./routes/resource.routes.js";
import { communityRoutes } from "./routes/community.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`MINDCARE server running on http://localhost:${PORT}`);
});
