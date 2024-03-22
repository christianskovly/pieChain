const express = require("express");
const router = express.Router();
const blockchainControllers = require("../controllers/blockchain");

router.get("/", blockchainControllers.getHome);

//get entire blockchain
router.get("/blockchain", blockchainControllers.getBlockchain);

// create a new transaction
router.post("/transaction", blockchainControllers.makeTransaction);

// broadcast transaction to all the other nodes
router.post(
  "/transaction/broadcast",
  blockchainControllers.broadcastTransaction,
);

module.exports = router;
