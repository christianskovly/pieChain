const Blockchain = require("../blockchain");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");

module.exports = {
  getBlock: async function (req, res) {
    try {
      const blockHash = req.params.blockHash;
      logValue(blockHash);
      const correctBlock = bitcoin.getBlock(blockHash);
      logValue(correctBlock);
      res.json({
        block: correctBlock,
      });
    } catch (err) {
      handleError(err);
    }
  },
  getTransaction: async function (req, res) {
    try {
      const transactionId = req.params.transactionId;
      logValue(blockHash);
      const transactionData = bitcoin.getTransaction(transactionId);
      logValue(transactionData);

      res.json({
        transaction: transactionData.transaction,
        block: transactionData.block,
      });
    } catch (err) {
      handleError(err);
    }
  },
  getAddress: async function (req, res) {
    try {
      const address = req.params.address;
      logValue(address);
      const addressData = bitcoin.getAddressData(address);
      logValue(addressData);
      res.json({
        addressData: addressData,
      });
    } catch (err) {
      handleError(err);
    }
  },
  getBlockExplorer: async function (req, res) {
    try {
      res.sendFile("../block-explorer/index.html", { root: __dirname });
    } catch (err) {
      handleError(err);
    }
  },
};
