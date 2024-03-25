const rp = require("request-promise");
const Blockchain = require("../config/blockchain");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");

module.exports = {
  registerAndBroadcastNode: async function (req, res) {
    try {
      const newNodeUrl = req.body.newNodeUrl;
      logValue(newNodeUrl);
      if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1)
        bitcoin.networkNodes.push(newNodeUrl);

      const regNodesPromises = [];
      bitcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
          uri: networkNodeUrl + "/register-node",
          method: "POST",
          body: { newNodeUrl: newNodeUrl },
          json: true,
        };
        logValue(requestOptions);

        regNodesPromises.push(rp(requestOptions));
      });

      logValue(regNodesPromises);

      Promise.all(regNodesPromises)
        .then((data) => {
          logValue(data);
          const bulkRegisterOptions = {
            uri: newNodeUrl + "/register-nodes-bulk",
            method: "POST",
            body: {
              allNetworkNodes: [
                ...bitcoin.networkNodes,
                bitcoin.currentNodeUrl,
              ],
            },
            json: true,
          };
          logValue(bulkRegisterOptions);

          return rp(bulkRegisterOptions);
        })
        .then((data) => {
          logValue(data);
          res.json({ note: "New node registered with network successfully." });
        });
    } catch (err) {
      handleError(err);
    }
  },
  registerNode: async function (req, res) {
    try {
      const newNodeUrl = req.body.newNodeUrl;
      const nodeNotAlreadyPresent =
        bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
      const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
      if (nodeNotAlreadyPresent && notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);
      res.json({ note: "New node registered successfully." });
    } catch (err) {
      handleError(err);
    }
  },
  bulkRegisterNodes: async function (req, res) {
    try {
      const allNetworkNodes = req.body.allNetworkNodes;
      logValue(allNetworkNodes);
      allNetworkNodes.forEach((networkNodeUrl) => {
        const nodeNotAlreadyPresent =
          bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        logValue(nodeNotAlreadyPresent);
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        logValue(notCurrentNode);
        if (nodeNotAlreadyPresent && notCurrentNode)
          bitcoin.networkNodes.push(networkNodeUrl);
        logValue(networkNodeUrl);
      });

      res.json({ note: "Bulk registration successful." });
    } catch (err) {
      handleError(err);
    }
  },
  getConsensus: async function (req, res) {
    try {
      const requestPromises = [];
      logValue(requestPromises);
      bitcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
          uri: networkNodeUrl + "/blockchain",
          method: "GET",
          json: true,
        };

        logValue(requestOptions);
        requestPromises.push(rp(requestOptions));
      });

      Promise.all(requestPromises).then((blockchains) => {
        logValue(blockchains);
        const currentChainLength = bitcoin.chain.length;
        logValue(currentChainLength);
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach((blockchain) => {
          if (blockchain.chain.length > maxChainLength) {
            maxChainLength = blockchain.chain.length;
            newLongestChain = blockchain.chain;
            newPendingTransactions = blockchain.pendingTransactions;
          }
        });
        logValue(maxChainLength);
        logValue(newLongestChain);
        logValue(newPendingTransactions);

        if (
          !newLongestChain ||
          (newLongestChain && !bitcoin.chainIsValid(newLongestChain))
        ) {
          res.json({
            note: "Current chain has not been replaced.",
            chain: bitcoin.chain,
          });
        } else {
          bitcoin.chain = newLongestChain;
          bitcoin.pendingTransactions = newPendingTransactions;
          res.json({
            note: "This chain has been replaced.",
            chain: bitcoin.chain,
          });
        }
      });
    } catch (err) {
      handleError(err);
    }
  },
};
