const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    resetPasswordToken:{
        type:String
    },
    resetTokenExpire:{
        type:Date
    },
    additionalDetails:{
        type:mongoose.Schema.ObjectId,
        ref:"profile"
    },
    friends:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"user"
        }
    ],
    posts:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"post"
        }
    ],
    requestSent:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"user"
        }
    ],
    requestReview:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"user"
        }
    ],
    likedPost:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"post"
        }
    ],
    postComment:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"comment"
        }
    ]

})

module.exports=  mongoose.model("user",userSchema);