const User = require("../Schema/userSchema")
const Profile = require("../Schema/profileSchema")
const Post = require("../Schema/postSchema")
const Comment = require("../Schema/commentSchema")
const {upload2Cloudinary} = require("../utils/fileUpload")


exports.deleteAccount = async(req,res)=>{
    try{
        const userId = req.user.id

            const userDetail = await User.findById(userId).populate("postComment")
            .populate({path:"posts",
                        populate:{
                            path:"comments",
                            model:"comment"
                        }}).exec();
        
                        
        const profileId = userDetail.additionalDetails;
        await Profile.findByIdAndDelete(profileId)
        const comments  = userDetail.postComment;

        await Promise.all(comments.map(async(comment)=>{
            const res= await Post.updateOne({},{$pull:{"comment":comment.post}})
            await Comment.findByIdAndDelete(comment._id);
        }))
        const posts = userDetail.posts;
        await Promise.all(posts.map(async(post)=>{
            post.comments.map(async(comment)=>{
                const res= await User.updateOne({},{$pull:{"postComment":comment._id}}) 
                await Comment.findByIdAndDelete(comment._id)
            })
            await Post.findByIdAndDelete(post._id)
        }))

        await User.findByIdAndDelete(userId)
        return res.status(200).json({
            success:true,
            message:"Account Deleted Successfully"
        })


    } catch(error){
        console.log("eroor",error)
        return res.status(400).json({
            success:false,
            message:"Technical Issue Try After Some Time"
        })
    }
}

exports.updateProfile = async(req,res) => {
    try{
        const {about,dob,gender,firstName,lastName}=req.body;
        const userId = req.user.id;
        const userDetail = await User.findById(userId)
        const profile = await Profile.findById(userDetail.additionalDetails)
        
        if(about){
            profile.about=about;
        }
        if(dob){
            profile.dob=dob
        }
        if(gender){
            profile.gender=gender
        }

        if(firstName){
            userDetail.firstName=firstName
        }
        if(lastName){
            userDetail.lastName=lastName
        }

        await profile.save()
        await userDetail.save()

        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec()
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            data:updatedUserDetails
        })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed To update the profile due to : ${error.message}`
        })
    }
}

exports.updateImage = async(req,res)=>{
    try{
        const userId = req.user.id;
    const image = req.files.image

    const uploadedImage = await upload2Cloudinary(image,process.env.FOLDER_NAME,1000,1000)

    const userDetail = await User.findByIdAndUpdate({_id:userId},{image:uploadedImage.secure_url},{new:true});

    return res.status(200).json({
        success:true,
        message:"Image Updated successfully",
        data:userDetail
    })
    }  catch(error){
        return res.status(400).json({
            success:false,
            message:"Technical Error Try After Some Time"
        })
    }
}



exports.userDetails = async(req,res) => {
    try{
        const {userId} = req.body;
        if(!userId){
            return res.status(400).json({
                success:false,
                message:`Provide all neccessary details`
            })
        }
        const userDetail = await User.findById(userId).populate("additionalDetails")
        .populate({
            path: "posts",
            populate: {
                path: "comments",
                model: "Comment"
            }
        }).populate("requestSent").populate("requestReview").exec()
        if(!userDetail){
            return res.status(400).json({
                success:false,
                message:"No such user exist on provided id"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Fetched Successfully",
            data:userDetail
        })

    } catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed to fetch the Details : ${error.message}`
        })
    }
}

exports.getAllUser = async(req,res) =>{
    try{
        const users = await User.find({}).populate("additionalDetails").exec()
        return res.status(200).json({
            success:true,
            message:"Details fetched Successfully",
            data:users
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed TO get all the users due to : ${error.message}`
        })
    }
}

