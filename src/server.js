import "dotenv/config.js";
import express from "express";
import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import { db, dbconnection } from "./db.js";
import cors from "cors";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentials = JSON.parse(fs.readFileSync("./Firebase_Credentials.json"));
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.use(async (req, res, next) => {
  const { authtoken } = req.headers;
  // console.log(req.headers.authtoken);
  if (authtoken) {
    try {
      req.user = await admin.auth().verifyIdToken(authtoken);
      // console.log(req.user);
    } catch (e) {
      return res.sendStatus(400);
    }
  }
  req.user = req.user || {};
  next();
});
app.use(cors());
app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvotesIds = article.upvoteIds || [];
    // console.log(uid);
    article.canUpvote = uid && !upvotesIds.includes(uid);
    // console.log(article);
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});
app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});
app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  let article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvotesIds = article.upvoteIds || [];
    // console.log(upvotesIds);
    const canUpvote = uid && !upvotesIds.includes(uid);
    // console.log(canUpvote);
    if (canUpvote) {
      await db.collection("articles").updateOne(
        { name },
        {
          $inc: { upvotes: 1 },
          $push: { upvoteIds: uid },
        }
      );
    }
    article = await db.collection("articles").findOne({ name });
    // console.log(article);

    res.json(article);
  } else {
    res.send("Article is not exist!");
  }
});
app.post("/api/articles/:name/comment", async (req, res) => {
  const { name } = req.params;
  const { text } = req.body;
  const { email } = req.user;
  // console.log(req.user);

  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comment: { postedBy: email, text } },
    }
  );
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    // article.comment.push({postedBy,text});
    res.json(article);
  } else {
    res.send("Article don't exist!");
  }
});
const PORT = process.env.PORT || 8000;
dbconnection(() => {
  console.log("db connected!");
  app.listen(PORT, () => {
    console.log("server is running!");
  });
});
