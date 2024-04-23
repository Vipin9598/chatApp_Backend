const Post = require("../Schema/postSchema");
const User = require("../Schema/userSchema")
const Comment = require("../Schema/commentSchema")
const { upload2Cloudinary } = require("../utils/fileUpload");

exports.createPost = async(req,res) =>{
    try{
        const userId = req.user.id
        const {desc}=req.body;
        const post = req.files.Post;
        if(!post || !desc){
            return res.status(400).json({
                success:false,
                message:"Post Details is missing"
            })
        }

        const postUpload = await upload2Cloudinary(post,process.env.FOLDER_NAME,1000,1000);
        
            const newPost = await Post.create({
                desc:desc,
                post:postUpload.secure_url,
                user:userId
            })

        
        const userDetails = await User.findById(userId)
        userDetails.posts.push(newPost._id);
        await userDetails.save();
        const posts = await Post.find({}).populate({
            path:"comments",
            populate:{
                path:"user"
            }
        }).populate("user").exec()
        console.log("posts.............",posts)
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate({path:"posts",
                                                            populate:{
                                                                path:"user"
                                                            }
                                                        
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()
            return res.status(200).json({
                success:true,
                message:"Post Created Successfully",
                data:updatedUserDetails,
                post:posts
            })

    
    } catch(error){
        return res.status(400).json({
            success:false,
            message:`Technical error  due to : ${error.message}`
        })
    }
}

exports.deletePost = async(req,res) =>{
    try{
        const userId = req.user.id
    const {postId} = req.body;

    if( !postId){
        return res.status(400).json({
            success:false,
            message:"Provide All the Details"
        })
    }

    const postDetail = await Post.findById(postId).populate("comments").exec()
    if(!postDetail){
        return res.status(200).json({
            success:false,
            message:"No such post exist with this postId"
        })
    }

    if(postDetail.user != userId){
        return res.status(400).json({
            success:false,
            message:"you cant delete the post of another Person"
        })
    }

    await Promise.all(postDetail.comments.map(async(comment)=>{
            const commentUserId = comment.user;
            const res= await User.findByIdAndUpdate(commentUserId,{$pull:{"postComment":comment._id}}) 
            await Comment.findByIdAndDelete(comment._id)
    }))

    
    const UserDetails = await User.findByIdAndUpdate(userId,{$pull:{posts:postId}})
    await Post.findByIdAndDelete(postId)
    const posts = await Post.find({}).populate({
        path:"comments",
        populate:{
            path:"user"
        }
    }).populate("user").exec()
    console.log("posts.............",posts)
    const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                    populate("friends").
                                                    populate({path:"posts",
                                                        populate:{
                                                            path:"user"
                                                        }
                                                    
                                                    }).populate("requestSent").
                                                    populate("requestReview").exec()
    return res.status(200).json({
        success:true,
        message:"Post Deleted Successfully",
        data:updatedUserDetails,
        post:posts
    })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:    T`echnical error in delete Post due to ${error.message} `
        })
    }

}

exports.addComment = async(req,res)=>{
    try{
        const userId = req.user.id
        const {comment,postId} = req.body

        if(!comment || !postId){
            return res.status(400).json({
                success:false,
                message:"Provide All the Details"
            })
        }

        const postDetail = await Post.findById(postId)
        if(!postDetail){
            return res.status(400).json({
                success:false,
                message:"Post Id not exist"
            })
        }

        if(postDetail.comments.includes(userId)){
            return res.status(400).json({
                success:false,
                message:"Already Commented on this post"
            })
        }

        const newComment = await Comment.create({
            comment:comment,
            post:postId,
            user:userId
        })

        const updatedPost = await Post.findByIdAndUpdate(postId,{$push:{comments:newComment._id}},{new:true})


        const userDetail = await User.findById(userId);
        userDetail.postComment.push(newComment._id);
        await userDetail.save();

        const posts = await Post.find({}).populate({
            path:"comments",
            populate:{
                path:"user"
            }
        }).populate("user").exec()
        console.log("posts.............",posts)
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate({path:"posts",
                                                            populate:{
                                                                path:"user"
                                                            }
                                                        
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()

        return res.status(200).json({
            success:true,
            message:"Comment Added Successfully",
            post:posts,
            data:updatedUserDetails
        })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed To add the comment due to : ${error.message}`
        })
    }
}

exports.deleteComment = async(req,res) => {
    try{
        const userId = req.user.id
        const {commentId} = req.body;
        if(!commentId){
            return res.status(400).json({
                sucess:false,
                message:"Provide the neccessary Details"
            })
        }
        const commentDetails = await Comment.findById(commentId)

        if(!commentDetails){
            return res.status(400).json({
                success:false,
                message:"Comment id is wrong,no such comment exist with this id"
            })
        }

        const postId = commentDetails.post
        const userid = commentDetails.user

        if(userId != userid){
            return res.status(400).json({
                success:false,
                message:"you cant delete the comment of another Person"
            })
        }
        const updatedPost = await Post.findByIdAndUpdate(postId,{$pull:{comments:commentId}},{new:true})

        const userDetails = await User.findByIdAndUpdate(userid,{$pull:{postComment:commentId}},{new:true})

        await Comment.findByIdAndDelete(commentId)
        const posts = await Post.find({}).populate({
            path:"comments",
            populate:{
                path:"user"
            }
        }).populate("user").exec()
        console.log("posts.............",posts)
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate({path:"posts",
                                                            populate:{
                                                                path:"user"
                                                            }
                                                        
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()
        return res.status(200).json({
            success:true,
            message:"Comment Deleted Successfully",
            data:updatedUserDetails,
            post:posts
        })



    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Failed to delete the comment"
        })
    }
}

exports.likePost = async(req,res)=>{
    try{
        const {postId} = req.body;
        const userId = req.user.id

        const postDetail = await Post.findById(postId)
        const userDetail = await User.findById(userId);

        if(!postDetail){
            return res.status(400).json({
                success:false,
                message:"Post Not found this post id"
            })
        }

        const checkIndex = postDetail.likes.findIndex(id => id.toString() === userId.toString())

        if(checkIndex!=-1){
            postDetail.likes.splice(checkIndex,1);
        
        const checkPresent = userDetail.likedPost.findIndex((post)=>post.toString()===postId.toString());
        userDetail.likedPost.splice(checkPresent,1);
        
        }
        else{
            postDetail.likes.push(userId);
            userDetail.likedPost.push(postId)
        }
        await postDetail.save();
        await userDetail.save();

        const posts = await Post.find({}).populate({
            path:"comments",
            populate:{
                path:"user"
            }
        }).populate("user").exec()
        console.log("posts.............",posts)
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate({path:"posts",
                                                            populate:{
                                                                path:"user"
                                                            }
                                                        
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()
        return res.status(200).json({
            success:true,
            message:"Like Updated Successfully",
            data:updatedUserDetails,
            post:posts
        })



    }catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

exports.fetchAllPost = async(req,res)=>{
    const userId = req.user.id
    try{
        const posts = await Post.find({}).populate({
            path:"comments",
            populate:{
                path:"user"
            }
        }).populate("user").exec()
        console.log("posts.............",posts)
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").
                                                        populate("friends").
                                                        populate({path:"posts",
                                                            populate:{
                                                                path:"user"
                                                            }
                                                        
                                                        }).populate("requestSent").
                                                        populate("requestReview").exec()
        return res.status(200).json({
            success:true,
            message:"All posts fetched successfully",
            post:posts,
            data:updatedUserDetails
            
        })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed to fetch the post due to : ${error.message}`
        })
    }
    
}
