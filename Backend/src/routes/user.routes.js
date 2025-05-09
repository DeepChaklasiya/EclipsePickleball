const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes
router.use(protect);

// User profile routes
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.delete("/profile", userController.deactivateAccount);

// Admin routes
router.use(restrictTo("admin"));
router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
