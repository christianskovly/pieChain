const { MongoClient } = require('mongodb');

const connectDB = async ()=>{//can also use .then here
try{
    const client = new MongoClient(process.env.DATABASE_URL);
    client.connect();
    const database = client.db('PieChain'); // Replace with your database name
    database.collection('users'); // Replace with your collection name

}catch(err){
    console.error(err)
    process.exit(1)
}
}


module.exports = connectDB