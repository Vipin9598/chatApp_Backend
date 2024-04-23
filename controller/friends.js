const User = require("../Schema/userSchema")
const Profile = require("../Schema/profileSchema")
const Post = require("../Schema/postSchema")


// request bhejni ho ya d bheji hui htani ho
exports.manageFriendRequest = async(req,res) =>{
    try{
        const userId = req.user.id
        const {friendId} = req.body
        const userDetail = await User.findById(userId)
        const friendDetail = await User.findById(friendId)
        if(!friendDetail){
            return res.status(200).json({
                success:false,
                message:"No id exist for your friend request"
            })
        }

        const alreadyFriend = userDetail.friends.findIndex((id)=>id.toString()===friendId.toString())
        
        if(alreadyFriend!==-1){
            return res.status(200).json({
                success:false,
                message:"Alredy Friend"
            })
        }

        const index = userDetail.requestSent.findIndex((id)=>id.toString()=== friendId.toString())
        let message;
        if(index!==-1){
            console.log("request htani j")
            userDetail.requestSent.splice(index,1);
            const sentIndex = friendDetail.requestReview.findIndex((Id)=> userId.toString()===Id.toString())
            friendDetail.requestReview.splice(sentIndex,1);
            message="Request Deleted"
        }
        else{
            console.log("request bhejdi")
            userDetail.requestSent.push(friendId)
            friendDetail.requestReview.push(userId)
            message="Request Sent"
        }
        await userDetail.save()
        await friendDetail.save()
        
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate("posts",{
                                                            populate:{
                                                                path:"comments",
                                                                model:"Comment"
                                                            }
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()
        return res.status(200).json({
            success:true,
            message:message,
            data:updatedUserDetails
        })
    } catch(error){
        console.log(error.message)
        console.log(error)
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

// request accept krni ho
exports.requestAccept = async(req,res) => {
    try{
        const {friendId} = req.body
        const userId = req.user.id

        const friendDetail = await User.findById(friendId)
        const userDetail = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate("posts",{
                                                            populate:{
                                                                path:"comments",
                                                                model:"Comment"
                                                            }
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()

        if(!friendDetail){
            return res.status(400).json({
                success:false,
                message:"No id exist for your friend request"
            })
        }

        const checkAlreadyPresent = userDetail.friends.findIndex((friend)=>friend._id.toString() === friendId.toString())

        
        const ReviewIndex = userDetail.requestReview.findIndex((id)=> id.toString()===friendId.toString())
        const sentIndex = friendDetail.requestSent.findIndex((id)=>id.toString()===userId.toString())

        userDetail.requestReview.splice(ReviewIndex,1);
        friendDetail.requestSent.splice(sentIndex,1);


        if(checkAlreadyPresent===-1){
            userDetail.friends.push(friendId);
        friendDetail.friends.push(userId);

        }
        
        await userDetail.save()
        await friendDetail.save()

        return res.status(200).json({
            success:true,
            message:"Request Approved",
            data:userDetail
        })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

//request delete krni ho accept nhi krni ho
exports.requestReject = async(req,res) =>{
    try{
        const {friendId} = req.body
        const userId = req.user.id

        const friendDetail = await User.findById(friendId)
        const userDetail = await User.findById(userId)

        if(!friendDetail){
            return res.status(400).json({
                success:false,
                message:"No id exist for your friend request"
            })
        }

        const ReviewIndex = userDetail.requestReview.findIndex((id)=> id.toString()===friendId.toString())
        const sentIndex = friendDetail.requestSent.findIndex((id)=>id.toString()===userId.toString())

        if(ReviewIndex===-1){
            return res.status(400).json({
                success:false,
                message:"This Id is not present in reviewRequest"
            })
        }

        userDetail.requestReview.splice(ReviewIndex,1);
        friendDetail.requestSent.splice(sentIndex,1);

        await userDetail.save()
        await friendDetail.save()
        const updatedUserDetail = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate("posts",{
                                                            populate:{
                                                                path:"comments",
                                                                model:"Comment"
                                                            }
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()

        return res.status(200).json({
            success:true,
            message:"Request Rejected",
            data:updatedUserDetail
        })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

// agr kisi friend ko unfriend marna ho 
exports.unFriend = async(req,res)=>{
    try{
        const {friendId} = req.body
        const userId = req.user.id

        const friendDetail = await User.findById(friendId)
        const userDetail = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate("posts",{
                                                            populate:{
                                                                path:"comments",
                                                                model:"Comment"
                                                            }
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()

        if(!friendDetail){
            return res.status(400).json({
                success:false,
                message:"No id exist for your friend request"
            })
        }

        const userCheckIndex = userDetail.friends.findIndex((id)=> id._id.toString()===friendId.toString())
        const friendCheckIndex = friendDetail.friends.findIndex((id)=>id.toString()===userId.toString())
        if(userCheckIndex===-1){
            return res.status(401).json({
                success:true,
                message:"This id is not pressent in your friends",
                data:userDetail
            })
        }
        userDetail.friends.splice(userCheckIndex,1);
        friendDetail.friends.splice(friendCheckIndex,1);
        await userDetail.save()
        await friendDetail.save()
        const updatedUserDetail = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate("posts",{
                                                            populate:{
                                                                path:"comments",
                                                                model:"Comment"
                                                            }
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()


        return res.status(200).json({
            success:true,
            message:"Un friend Successfully",
            data:updatedUserDetail
        })



    } catch(error){
        return res.status(402).json({
            success:false,
            message:`Failed to unfriend due to : ${error.message}`
        })
    }
}