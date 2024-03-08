const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid').v1;
const port = process.argv[2];
const rp = require('request-promise');
const nodeAddress = uuid().split('-').join('');
const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});

// create a new transaction
app.post('/transaction', function (req, res) {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addtransactionToPendingTransactions(newTransaction);
  res.json({ note: "Transaction will be added in block ${blockINdex}."  });
});

// broadcast transaction to all the other nodes
app.post('/transaction/broadcast', function(req, res){
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  bitcoin.addtransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
          uri: networkNodeUrl + '/transaction',
          method: 'POST',
          body: newTransaction,
          json: true
      };

      requestPromises.push(rp(requestOptions)); 
});

Promise.all(requestPromises)
  .then(data => {
    res.json({ note: 'Transaction created and broadcast successfully.' });
  });
});

//  MINE BLOCK
//  move this to miner client side code
//  ..................................................
//  replace this with a register miner endpoint
//      app.get('/miner-registration', (req, res)) {
//          
//      add new miner to array of available miners and send minerList to all other nodes
//
//      }
      

//  ASSIGN WORK TO MINER
//  
//  1 - Assigns work to miner on availableMiner list
//  2 - Removes miner from availableMiner list
//  3 - Recieves work back
//  4 - Checks to see if valid
//  5 - Creates miner reward block
//  6 - Adds miner to availableMiner list
//  ADD new endpoint to recieve work back from miner and assign new work
//

// BELOW CODE GETS MOVED TO CLIENT MINER
// .......................................................
// also add a minerRes endpoint to revcieve 
app.get('/mine', function(req, res) {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock['index'] + 1
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock },
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

// MINER REWARD
// 
// ADD REWARDS TO NODE WORK
//
  Promise.all(requestPromises)
  .then(data => {
    const requestOptions = {
      uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
      method: 'POST',
      body: {
        amount: 12.5,
        sender: "00",
        recipient: nodeAddress
      },
      json: true
    };

    return rp(requestOptions);
  })
  .then(data => {
    res.json({
      note: "New block mined & broadcast successfully",
      block: newBlock
    });
  });
});

// receive new block - sync blocks accross network nodes
app.post('/receive-new-block', function(req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash == newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 == newBlock['index'];

    if (correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.json({ 
          note: 'New block received and accepted.',
          newBlock: newBlock
      });
    } else {
      res.json({
        note: 'New block rejected.',
        newBlock: newBlock
      });
    }

});

// NEW NODE REGISTRATION PART 1 -  Node is added and broadcast to network
// receives new node information and sends it to all nodes already in the network
app.post('/register-and-broadcast-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl: newNodeUrl },
      json: true
    };

    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
  .then(data => {
    const bulkRegisterOptions = {
      uri: newNodeUrl + '/register-nodes-bulk',
      method: 'POST',
      body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
      json: true
    };

    return rp(bulkRegisterOptions);
  })
  .then(data => {
    res.json({ note: 'New node registered with network successfully.' });
  });
});


// NEW NODE REGISTRATION PART 2 - register new node with the remaining network
// 
app.post('/register-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
  res.json({ note: 'New node registered successfully.' });
});

//  NEW NODE REGISTRATION PART 3 - New node receives list of all network nodes 
//  Register multiple nodes at once
//  The new node receives this list of all other nodes on tne network after all other nodes add it
//  add CONSENSUS code to registration 
//      so that new node has current blockchain
//  ......................................................................................
//
app.post('/register-nodes-bulk', function(req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
  });

  res.json({ note: 'Bulk registration successful.' });
});

// CONSENSUS -  Check with all other nodes to find the longest blockchain legnth. If the length is
//              greater then yours, update with the longest blockchain
//              This endpoint is a manual blockchain update
// ..............................................................................................
//
app.get('/consensus', function(req, res) {
  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/blockchain',
      method: 'GET',
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
  .then(blockchains => {
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(blockchain => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      };
    });


    if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
      res.json({
        note: 'Current chain has not been replaced.',
        chain: bitcoin.chain
      });
    }
    else {
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;
      res.json({
        note: 'This chain has been replaced.',
        chain: bitcoin.chain
      });
    }
  });
});

//  BLOCKCHAIN EXPLORER
//  ......................................................................
// 
//
// get block by blockHash
app.get('/block/:blockHash', function(req, res) { 
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
    block: correctBlock
  });
});


// get transaction by transactionId
app.get('/transaction/:transactionId', function(req, res) {
  const transactionId = req.params.transactionId;
  const trasactionData = bitcoin.getTransaction(transactionId);
  res.json({
    transaction: trasactionData.transaction,
    block: trasactionData.block
  });
});

// get address by address
app.get('/address/:address', function(req, res) {
  const address = req.params.address;
  const addressData = bitcoin.getAddressData(address);
  res.json({
    addressData: addressData
  });
});

// block explorer
app.get('/block-explorer', function(req, res) {
  res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}...`);
});
