import "dotenv/config";
import statsCard from "./api/index.js";
import repoCard from "./api/pin.js";
import langCard from "./api/top-langs.js";
import wakatimeCard from "./api/wakatime.js";
import gistCard from "./api/gist.js";
import express from "express";

const app = express();
const router = express.Router();

// Health check endpoint.
router.get("/health", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
  );
});

// Card endpoints.
router.get("/", statsCard);
router.get("/pin", repoCard);
router.get("/top-langs", langCard);
router.get("/wakatime", wakatimeCard);
router.get("/gist", gistCard);

app.use("/api", router);

// Global error handler - catches unhandled errors from async route handlers.
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message || err);
  res.status(500).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ error: "Internal server error" }));
});

const port = process.env.PORT || process.env.port || 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}/api`);
});
