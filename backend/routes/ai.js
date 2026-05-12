const router = require("express").Router();

const {
  askAI,
  getAIInsights,
} = require("../controllers/ai");

router.post("/ai/ask", askAI);
router.get("/ai/insights", getAIInsights);

module.exports = router;