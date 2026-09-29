const express = require("express");
const cors = require("cors");
const analyzeRouter = require("./src/routes/analyze");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS is intentionally open for this LAN workshop demo.
// In a real deployment, restrict this to a specific frontend origin, e.g.:
// app.use(cors({ origin: "https://your-frontend-domain.com" }));
app.use(cors());

// Cap body size to reduce abuse risk from oversized payloads.
app.use(express.json({ limit: "100kb" }));

app.use("/api", analyzeRouter);

app.get("/", (req, res) => {
  res.json({
    name: "Digital Privacy Checker API",
    status: "running",
    endpoints: ["POST /api/analyze", "GET /api/history"],
  });
});

// Basic 404 + error handling so the API never crashes silently.
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Digital Privacy Checker backend running on http://0.0.0.0:${PORT}`);
});
