import { MongoClient } from "mongodb";
let db;
 async function dbconnection(cb){
    const client = new MongoClient('mongodb://127.0.1.1:27017');
    await client.connect();

     db = client.db('react-blog-db');
     cb();
 };

 export {
    db,dbconnection,
 }