import { MongoClient } from "mongodb";
let db;
async function dbconnection(cb) {
  const client = new MongoClient(
    `mongodb+srv://${process.env.mongodbUsername}:${process.env.mongodbPassword}@cluster0.pntuers.mongodb.net/`
  );
  await client.connect();

  db = client.db("react-blog-db");
  cb();
}

export { db, dbconnection };
