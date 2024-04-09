const rp = require("request-promise");
const Blockchain = require("../config/blockchain");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { MongoClient } = require('mongodb');
require("dotenv").config();

module.exports = {
  signup: async function (req, res) {
    const uri = process.env.DATABASE_URL; // Replace with your MongoDB connection string
    const client = new MongoClient(uri);
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
        return;
      }

      //hashes password

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      //create user

      let user = new User({
        email,
        password: hashedPassword,
      });

      await client.connect();
      const database = client.db('PieChain'); // Replace with your database name
      const collection = database.collection('users'); // Replace with your collection name
      const result = await collection.insertOne(user);
      res.status({user});
      res.redirect("/blockchainExplorer");

    }finally {
      await client.close();
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