require("dotenv").config();
const express = require("express");
const cors = require("cors");

const chatRouter = require("./routes/chat");
const menuRouter = require("./routes/menu");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRouter);
app.use("/api/menu", menuRouter);

app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🍽️  Intelligent Bistro API running on http://localhost:${PORT}`);
});
