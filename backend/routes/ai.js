const router = require("express").Router();

const { protect } = require("../middleware/auth");

const {
  askAI,
  getAIInsights,
} = require("../controllers/ai");

router.post("/ai/ask", protect, askAI);

router.get("/ai/insights", protect, getAIInsights);

module.exports = router;