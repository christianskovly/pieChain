const express = require("express");
const router = express.Router();
const blockchainExplorerControllers = require("../controllers/blockchainExplorer");

//get block
router.get("/block/:blockHash", blockchainExplorerControllers.getBlock);

//get transaction
router.get(
  "/transaction/:transactionId",
  blockchainExplorerControllers.getTransaction,
);

// get address
router.get("/address/:address", blockchainExplorerControllers.getAddress);

// block explorer
router.get("/", blockchainExplorerControllers.getBlockExplorer);

module.exports = router;
