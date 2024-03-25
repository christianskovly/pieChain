const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth");

router.post("/", authControllers.signup);

router.post("/", authControllers.login);

module.exports = router;
