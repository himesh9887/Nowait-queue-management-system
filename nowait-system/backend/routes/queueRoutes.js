const express = require("express");

const {
  bookToken,
  getBookings,
  getQueueStatus,
  nextToken,
  resetQueue,
  skipToken,
} = require("../controllers/queueController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/book-token", bookToken);
router.get("/queue-status", getQueueStatus);
router.get("/bookings", requireAdmin, getBookings);
router.post("/next-token", requireAdmin, nextToken);
router.post("/skip-token", requireAdmin, skipToken);
router.post("/reset", requireAdmin, resetQueue);

module.exports = router;
