const rp = require("request-promise");
const Blockchain = require("../config/blockchain");
const uuid = require("uuid").v1;
const nodeAddress = uuid().split("-").join("");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");

module.exports = {
  getMiner: async function (req, res) {
    try {
      const lastBlock = bitcoin.getLastBlock();
      logValue(lastBlock);
      const previousBlockHash = lastBlock["hash"];
      logValue(previousBlockHash);
      const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock["index"] + 1,
      };
      logValue(currentBlockData);
      const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
      logValue(nonce);
      const blockHash = bitcoin.hashBlock(
        previousBlockHash,
        currentBlockData,
        nonce,
      );
      logValue(blockHash);
      const newBlock = bitcoin.createNewBlock(
        nonce,
        previousBlockHash,
        blockHash,
      );
      logValue(newBlock);
      const requestPromises = [];
      bitcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
          uri: networkNodeUrl + "/receive-new-block",
          method: "POST",
          body: { newBlock: newBlock },
          json: true,
        };

        logValue(requestOptions);
        requestPromises.push(rp(requestOptions));
      });
      logValue(requestPromises);

      Promise.all(requestPromises)
        .then((data) => {
          logValue(data);
          const requestOptions = {
            uri: bitcoin.currentNodeUrl + "/transaction/broadcast",
            method: "POST",
            body: {
              amount: 12.5,
              sender: "00",
              recipient: nodeAddress,
            },
            json: true,
          };
          logValue(data);

          return rp(requestOptions);
        })
        .then((data) => {
          logValue(data);
          res.json({
            note: "New block mined & broadcast successfully",
            block: newBlock,
          });
        });
    } catch (err) {
      handleError(err);
    }
  },
  recieveMiner: async function (req, res) {
    try {
      // receive new block - sync blocks accross network nodes
      const newBlock = req.body.newBlock;
      logValue(newBlock);
      const lastBlock = bitcoin.getLastBlock();
      logValue(lastBlock);
      const correctHash = lastBlock.hash == newBlock.previousBlockHash;
      logValue(correctHash);
      const correctIndex = lastBlock["index"] + 1 == newBlock["index"];
      logValue(correctIndex);

      if (correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        logValue(bitcoin.chain);
        bitcoin.pendingTransactions = [];
        res.json({
          note: "New block received and accepted.",
          newBlock: newBlock,
        });
        logValue(newBlock);
      } else {
        res.json({
          note: "New block rejected.",
          newBlock: newBlock,
        });
      }
      logValue(newBlock);
    } catch (err) {
      handleError(err);
    }
  },
};