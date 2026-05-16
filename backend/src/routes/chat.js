const express = require("express");
const router = express.Router();
const { processOrder } = require("../services/ai");
const menu = require("../data/menu");

router.post("/", async (req, res) => {
  try {
    const { message, cartItems = [], conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "message is required" });
    }

    const result = await processOrder({
      userMessage: message.trim(),
      cartItems,
      menuData: menu,
      conversationHistory,
    });

    res.json({
      message: result.message,
      actions: result.actions,
      assistantRaw: result.assistantMessage,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      error: "Something went wrong processing your request.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
