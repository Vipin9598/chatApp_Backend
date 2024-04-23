const cloudinary = require('cloudinary').v2

exports.cloudinaryConnect=async()=>{
    try{
        await cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
            secure:true
        })
        console.log("cloud connected");
    }
    catch(error){
        console.log("Failed to connect with cloudinary");
        console.log(error.message);
    }
}
