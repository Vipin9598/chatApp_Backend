const User = require("../Schema/userSchema")
const mailSender = require("../utils/mailSender")
const crypto = require("crypto")
const bcrypt = require("bcrypt")


exports.resetPasswordToken = async(req,res)=>{
    try{
        const {email} = req.body
        
        const userDetail = await User.findOne({email:email});
        if(!userDetail){
            return res.status(400).json({
                success:false,
                message:"Email Not registered"
            })
        }
        const token = await crypto.randomUUID()
        const updatedUserDetails = await User.findByIdAndUpdate(userDetail._id,
            {resetPasswordToken:token},
            {resetTokenExpire:Date.now()+3*60*1000},
            {new:true}
        )

        const mailres = await mailSender(email,"From Chat App",`This is the link on which you  generate a new password ${`http://localhost:3000/reset-password/${token}`}`)

        return res.status(200).json({
            success:true,
            message:"Email sent Successfully"
        })

    } catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

exports.resetPassword = async(req,res)=>{
    try{
        const {newPassword,confirmNewPassword,token}=req.body;
        if(!newPassword || !confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:"Provide All details"
            })
        }
        if(newPassword!=confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:"Password & confirmPassword Not Matched"
            })
        }

        const userDetail = await User.findOne({resetPasswordToken:token})
        if(!userDetail){
           
            return res.json({
                success:false,
                message : "Invalid Token",
                error
            })
        }

        if(userDetail.resetTokenExpire < Date.now()){
            return res.json({
                success:false,
                message:"Token expire, please generate new token"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(userDetail._id,
                            {password:hashedPassword })
        return res.status(200).json({
            success:true,
            message:"Password Reset Successfully"
        })
    } catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}