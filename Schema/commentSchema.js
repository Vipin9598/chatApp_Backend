const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    comment:{
        type:String,
        trim:true,
        required:true
    },
    post:{
        type:mongoose.Schema.ObjectId,
        ref:"post",
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("comment",commentSchema)