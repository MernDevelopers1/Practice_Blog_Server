import express from "express";
import {db,dbconnection} from "./db.js";
import cors from 'cors'
const app = express();
app.use(express.json());
app.use(cors());
app.get('/api/articles/:name',async (req,res)=>{
    const {name} = req.params;

   

    const article = await db.collection('articles').findOne({name});
    if(article){

        res.json(article);
    }else{
        res.sendStatus(404);
    }
})

app.put("/api/articles/:name/upvote",async (req,res)=>{
    const {name} = req.params;
    
    await db.collection('articles').updateOne({name},{
        $inc:{upvotes:1}
    });
    const article = await db.collection('articles').findOne({name});
    if(article){
        
        res.json(article);
    }else{
        res.send('Article is not exist!');
    }
});
app.post("/api/articles/:name/comment",async (req,res)=>{
    const {name} = req.params;
    const {postedBy,text} = req.body;
    
    await db.collection('articles').updateOne({name},{
        $push:{comment:{postedBy,text}}
    });
    const article = await db.collection('articles').findOne({name});
    if(article){
        // article.comment.push({postedBy,text});
        res.json(article);
    }else{
        res.send("Article don't exist!");
    }
})
dbconnection(()=>{
    
    
    console.log("db connected!");
    app.listen(8000,()=>{
        console.log("server is running!");
    });
}
    
);