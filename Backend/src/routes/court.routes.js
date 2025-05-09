const express = require("express");
const courtController = require("../controllers/courtController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", courtController.getAllCourts);
router.get("/:id", courtController.getCourt);

// Admin routes - protected
router.use(protect);
router.use(restrictTo("admin"));

router.route("/").post(courtController.createCourt);

router
  .route("/:id")
  .patch(courtController.updateCourt)
  .delete(courtController.deleteCourt);

module.exports = router;
