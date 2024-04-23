const cloudinary = require("cloudinary").v2;

exports.upload2Cloudinary = async(file,folder,height,quality)=>{
    try{
        const options={folder}
    if(height) options.height=height;
    if(quality) options.quality=quality;
    options.resource_type="auto";

    const res = await cloudinary.uploader.upload(file.tempFilePath,options)
    console.log(res)
    return res;
    }
    catch(error){
        console.log("Failed to upload to cloundinary")
        console.log(error.message)
    }
}