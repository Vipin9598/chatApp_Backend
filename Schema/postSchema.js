const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    post:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        trim:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user"
    },
    likes:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"user"
        }
    ],
    comments:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"comment"
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("post",postSchema)