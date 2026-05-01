import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import recordRoutes from "./routes/record.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.use(cors(
  
));
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "..", "..", "frontend", "dist");
const clientIndex = path.join(clientDist, "index.html");
const hasClientBuild = fs.existsSync(clientIndex);

if (hasClientBuild) {
  app.use(express.static(clientDist));
}

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);



app.get("/", (req, res) => {
  if (hasClientBuild) return res.sendFile(clientIndex);
  res.send("Task Manager API is running");
});



app.use((req, res) => {

  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Not found" });
  }


  if (hasClientBuild) {
    return res.sendFile(clientIndex);
  }

  return res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

export default app;
