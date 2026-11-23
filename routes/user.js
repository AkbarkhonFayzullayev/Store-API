const express = require("express");
const {
  userChangePassword,
  userChangeUsername,
  userList,
} = require("../controllers/user");
const authenticateUser = require("../middleware/authentication");
const authorize = require("../middleware/authorize");
const router = express.Router();

router.route("/user-list").get(authenticateUser, authorize("admin"), userList);
router.route("/change-password").post(authenticateUser, userChangePassword);
router.route("/change-username").post(authenticateUser, userChangeUsername);

module.exports = router;
