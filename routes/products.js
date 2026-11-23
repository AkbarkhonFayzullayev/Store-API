const express = require("express");
const router = express.Router();
const {
  getAllProductsStatic,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products");
const asyncWrapper = require("../middleware/async");
const authenticateUser = require("../middleware/authentication");
const authorize = require("../middleware/authorize");

router
  .route("/")
  .get(
    authenticateUser,
    authorize("customer", "admin", "seller"),
    asyncWrapper(getAllProducts),
  )
  .post(
    authenticateUser,
    authorize("admin", "seller"),
    asyncWrapper(createProduct),
  );

router
  .route("/static")
  .get(
    authenticateUser,
    authorize("admin", "seller"),
    asyncWrapper(getAllProductsStatic),
  );

router
  .route("/:id")
  .get(authenticateUser, authorize("admin", "seller"), asyncWrapper(getProduct))
  .put(
    authenticateUser,
    authorize("admin", "seller"),
    asyncWrapper(updateProduct),
  )
  .delete(
    authenticateUser,
    authorize("admin", "seller"),
    asyncWrapper(deleteProduct),
  );

module.exports = router;
