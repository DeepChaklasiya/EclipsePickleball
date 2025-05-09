const express = require("express");
const locationController = require("../controllers/locationController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", locationController.getAllLocations);
router.get("/:id", locationController.getLocation);

// Admin routes - protected
router.use(protect);
router.use(restrictTo("admin"));

router.route("/").post(locationController.createLocation);

router
  .route("/:id")
  .patch(locationController.updateLocation)
  .delete(locationController.deleteLocation);

module.exports = router;
