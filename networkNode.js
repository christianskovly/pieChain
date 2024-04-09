const express = require("express");
const app = express();
// const PORT = process.argv[2];
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const connectDB = require("./config/db");

const PORT = 8000;
const blockchainRoutes = require("./routes/blockchain");
const mineRoutes = require("./routes/mine");
const newNodeRoutes = require("./routes/newNode");
const blockchainExplorerRoutes = require("./routes/blockchainExplorer");
const authRoutes = require("./routes/auth");
require("dotenv").config();

connectDB();

const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  }),
);

//Sessions middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    //cookie: { secure: true }
  }),
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.set(express.static("block-explorer"));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/", blockchainRoutes);
app.use("/auth", authRoutes);
app.use("/mine", mineRoutes);
app.use("/newNode", newNodeRoutes);
app.use("/blockchainExplorer", blockchainExplorerRoutes);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});