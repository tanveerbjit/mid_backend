const express = require('express');
const router = express.Router();
const AdminController = require("../controller/AdminController")
const ProductController = require("../controller/ProductController");
const product_schema = require("../validation/schema/product_schema");
const product_schema_validation = require("../validation/product_schema_validation");
const isAdmin = require("../middleware/isAdmin");
const file_validation = require("../validation/file_upload_validation")



router.get("/profile", isAdmin,AdminController.profile);
router.get("/vendors", isAdmin,AdminController.all_vendors);
router.get("/only-user", isAdmin,AdminController.users_with_user_role);
router.get("/only-admin", isAdmin,AdminController.users_with_admin_role);



router.post(
  "/product/store",
  isAdmin,
  file_validation,
  product_schema,
  product_schema_validation,
  ProductController.store
);
router.put(
  "/product/update/:id",
  isAdmin,
  file_validation,
  product_schema,
  product_schema_validation,
  ProductController.update
);
router.delete("/product/destroy/:id", ProductController.destroy);

module.exports = router;