const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth");

router.post("/", authControllers.signup);

router.post("/login", authControllers.login);

router.post("/logout", authControllers.logout);

module.exports = router;
