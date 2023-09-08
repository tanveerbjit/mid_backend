const express = require("express");
const router = express.Router();
const AuthController = require("../controller/AuthController");
const roleAttacher = require("../middleware/roleAttacher");
const reg_schema_validation = require("../validation/reg_schema_validation");
const login_schema_validation = require("../validation/login_schema_validation");
const reg_schema = require("../validation/schema/reg_schema");
const login_schema = require("../validation/schema/login_schema");



router.post(
  "/admin/registration",
  reg_schema,
  reg_schema_validation,
  roleAttacher,
  AuthController.registration
);

router.post(
  "/user/registration",
  reg_schema,
  reg_schema_validation,
  roleAttacher,
  AuthController.registration
);


router.post("/login",login_schema,
  login_schema_validation, AuthController.login);

router.get("/logout", AuthController.logout);


module.exports = router;
