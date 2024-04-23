const mongoose = require("mongoose");
require("dotenv").config();
exports.dbconnect =async()=>{
    try{
        const res= await mongoose.connect(process.env.URL);
        console.log("Db Connected");

    }
    catch(error){
        console.log("Failed TO connect with Db")
        console.log(error.message)
    }
}