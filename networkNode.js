const express = require("express");
const app = express();
// const PORT = process.argv[2];
const PORT = 8000;
const blockchainRoutes = require("./routes/blockchain");
const mineRoutes = require("./routes/mine");
const newNodeRoutes = require("./routes/newNode");
const blockchainExplorerRoutes = require("./routes/blockchainExplorer");
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.set("view engine", "ejs");
app.set(express.static("public"));
app.set(express.static("block-explorer"));

app.use("/", blockchainRoutes);
app.use("/mine", mineRoutes);
app.use("/newNode", newNodeRoutes);
app.use("/blockchainExplorer", blockchainExplorerRoutes);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
