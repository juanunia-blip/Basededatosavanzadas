// backend/routes/auth.js
const router = require("express").Router();

const {
  register,
  login,
  me,
  updateMe
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

router.post("/auth/register", register);

router.post("/auth/login", login);

router.get("/auth/me", protect, me);

router.put("/auth/me", protect, updateMe);

module.exports = router;