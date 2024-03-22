const rp = require("request-promise");
const Blockchain = require("../config/blockchain");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");

module.exports = {
  //Get entire blockchain
  getBlockchain: async function (req, res) {
    try {
      const blockchain = await res.send(bitcoin);
      logValue(blockchain);
    } catch (err) {
      handleError(err);
    }
  },
  makeTransaction: async function (req, res) {
    try {
      const newTransaction = req.body;
      const blockIndex =
        bitcoin.addtransactionToPendingTransactions(newTransaction);
      logValue(blockIndex);
      logValue(newTransaction);
      res.json({ note: "Transaction will be added in block ${blockINdex}." });
    } catch (err) {
      handleError(err);
    }
  },
  broadcastTransaction: async function (req, res) {
    try {
      const newTransaction = bitcoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient,
      );
      bitcoin.addtransactionToPendingTransactions(newTransaction);

      logValue(newTransaction);

      const requestPromises = [];
      bitcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
          uri: networkNodeUrl + "/transaction",
          method: "POST",
          body: newTransaction,
          json: true,
        };

        logValue(requestOptions);
        requestPromises.push(rp(requestOptions));
      });

      logValue(requestPromises);

      Promise.all(requestPromises).then((data) => {
        logValue(data);
        res.json({ note: "Transaction created and broadcast successfully." });
      });
    } catch (err) {
      handleError(err);
    }
  },
  getHome: async function (req, res) {
    try {
      res.render("../block-explorer/home.ejs", { root: __dirname });
    } catch (err) {
      handleError(err);
    }
  },
};
