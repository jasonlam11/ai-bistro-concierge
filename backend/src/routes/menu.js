const express = require("express");
const router = express.Router();
const menu = require("../data/menu");

router.get("/", (req, res) => {
  const { category } = req.query;
  const filtered = category ? menu.filter((item) => item.category === category) : menu;
  res.json(filtered);
});

router.get("/categories", (req, res) => {
  const categories = [...new Set(menu.map((item) => item.category))];
  res.json(categories);
});

router.get("/:id", (req, res) => {
  const item = menu.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

module.exports = router;
