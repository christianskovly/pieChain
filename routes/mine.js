const express = require("express");
const router = express.Router();
const mineControllers = require("../controllers/mine");

router.get("/", mineControllers.getMiner);

router.post("/receive-new-block", mineControllers.recieveMiner);

module.exports = router;
