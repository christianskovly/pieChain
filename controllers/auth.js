const rp = require("request-promise");
const Blockchain = require("../config/blockchain");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");
const bcrypt = require("bcrypt");
const User = require("../models/User");

module.exports = {
  signup: async function (req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
      }

      //hashes password

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      //create user

      let user = new User({
        email,
        password: hashedPassword,
      });

      console.log(user);
    } catch (err) {
      handleError(err);
    }
  },
  login: async function (req, res) {
    try {
      console.log(req.body);
    } catch (err) {
      handleError(err);
    }
  },
};
