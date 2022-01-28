const express = require('express');
const app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin123:admin123@amazon-cluster.qnz6h.mongodb.net/AMAZON-BACKEND?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);

const db = mongoose.connection;

db.once('open',()=>{
    console.log("Connected to MongoDB successfully!");
})

db.on('error',(err)=>{
    console.log('Error'+err);
});


//Lets Create a Schema
let postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

//Lets Create a Model
const PostModel = mongoose.model('Post', postSchema);

const postObject = new PostModel({
    title:'A',
    author:'B',
    description:"c"
});

postObject.save(function(err){
    console.log('Inserted Successfully');
});

async function getMyPost(){
    const myPosts = await PostModel.find({author:'BB'});

    return myPosts;
}


let post = getMyPost();

post.then((d)=>{
    console.log(d);
}).catch((e)=>{

}).finally(()=>{});

//console.log(getMyPost());


//process.env.CONSTANTNAME
app.listen(5000 ,()=>{
    console.log(` The server is running on port 5000`);
});