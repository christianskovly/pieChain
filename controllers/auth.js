const rp = require("request-promise");
const Blockchain = require("../config/blockchain");
const bitcoin = new Blockchain();
const handleError = require("../config/Errors");
const logValue = require("../config/Test");

module.exports = {
 signup: async function(req, res){
    try{
        console.log(req.body);
    }catch(err){
        handleError(err);
    }
 },
 login: async function(req, res){
    try{
        console.log(req.body);

    }catch(err){
        handleError(err);
    }
 }   
}