const express = require("express");
const router = express.Router();
const ProductController = require("../controller/ProductController");
const paging = require("../middleware/paging");
const isUser = require("../middleware/isUser")
const cart_schema_validation = require("../validation/cart_schema_validation");
const cart_schema = require("../validation/schema/cart_schema");






///////////// CRUD OPERATION

router.get("/all",paging, ProductController.index);
router.get("/show/:id", ProductController.show);
router.post("/cart",cart_schema,cart_schema_validation,isUser, ProductController.cart);
router.patch("/cart-remove",cart_schema,cart_schema_validation,isUser, ProductController.cart_remove);
router.post("/checkout",isUser, ProductController.checkout);
router.get("/show-all-order", ProductController.show_order);




// router.get("/page/:offset/:limit", ProductController.pagination);
// router.get("/:type/:agg/:prop", ProductController.comparison);

module.exports = router;