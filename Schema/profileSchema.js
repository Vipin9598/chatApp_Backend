const mongoose=require("mongoose")
const profileSchema =new mongoose.Schema({
    
    about:{
        type:String,
        trim:true
    },
    gender:{
        type:String
    },
    dob:{
        type:Date
    }
})

module.exports = mongoose.model("profile",profileSchema);