require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const chatRouter = require("./routes/chat");
const menuRouter = require("./routes/menu");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY missing from environment. Refusing to start.");
  process.exit(1);
}

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "32kb" }));

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many chat requests. Please wait a moment." },
});

app.use(generalLimiter);
app.use("/api/chat", chatLimiter, chatRouter);
app.use("/api/menu", menuRouter);

app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  return res.status(500).json({ error: "Server error." });
});

app.listen(PORT, () => {
  console.log(`Intelligent Bistro API running on http://localhost:${PORT}`);
});
