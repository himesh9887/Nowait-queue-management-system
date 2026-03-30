const express = require("express");

const {
  bookToken,
  getBookings,
  getQueueStatus,
  nextToken,
  resetQueue,
  startServing,
  skipToken,
} = require("../controllers/queueController");
const {
  authorizeRoles,
  optionalAuth,
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/book-token", authenticate, authorizeRoles("user"), bookToken);
router.get("/queue", optionalAuth, getQueueStatus);
router.get("/queue-status", optionalAuth, getQueueStatus);
router.get("/bookings", authenticate, authorizeRoles("admin"), getBookings);
router.post("/start-serving", authenticate, authorizeRoles("admin"), startServing);
router.post("/next-token", authenticate, authorizeRoles("admin"), nextToken);
router.post("/skip-token", authenticate, authorizeRoles("admin"), skipToken);
router.post("/reset", authenticate, authorizeRoles("admin"), resetQueue);
router.post("/reset-queue", authenticate, authorizeRoles("admin"), resetQueue);

module.exports = router;
