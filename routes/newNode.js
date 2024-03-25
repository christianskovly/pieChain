const express = require("express");
const router = express.Router();
const newNodeControllers = require("../controllers/newNode");

// NEW NODE REGISTRATION PART 1 -  Node is added and broadcast to network
// receives new node information and sends it to all nodes already in the network
router.post(
  "/register-and-broadcast-node",
  newNodeControllers.registerAndBroadcastNode,
);

//  NEW NODE REGISTRATION PART 3 - New node receives list of all network nodes
//  Register multiple nodes at once
//  The new node receives this list of all other nodes on tne network after all other nodes add it
//  add CONSENSUS code to registration
//      so that new node has current blockchain

router.post("/register-node", newNodeControllers.registerNode);

router.post("/register-nodes-bulk", newNodeControllers.bulkRegisterNodes);

// CONSENSUS -  Check with all other nodes to find the longest blockchain legnth. If the length is
//              greater then yours, update with the longest blockchain
//              This endpoint is a manual blockchain update

router.get("/consensus", newNodeControllers.getConsensus);
module.exports = router;
