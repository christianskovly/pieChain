const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const PORT = process.argv[2];
const PORT = 8000;
const blockchainRoutes = require("./routes/blockchain");
const mineRoutes = require("./routes/mine");
const newNodeRoutes = require("./routes/newNode");
const blockchainExplorerRoutes = require("./routes/blockchainExplorer");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set(express.static("public"));
app.set(express.static("block-explorer"));

app.use("/", blockchainRoutes);
app.use("/mine", mineRoutes);
app.use("/newNode", newNodeRoutes);
app.use("/blockchainExplorer", blockchainExplorerRoutes);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
