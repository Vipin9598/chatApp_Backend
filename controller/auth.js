const User = require("../Schema/userSchema")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const Profile = require("../Schema/profileSchema")
const mailSender = require("../utils/mailSender")
const jwt = require("jsonwebtoken")

exports.logIn = async(req,res)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please provide all the neccessary Details"
            })
        }
        
        const user = await User.findOne({email}).populate("friends").populate("posts").populate("additionalDetails").populate("requestSent").populate("requestReview").exec();

        if(!user){
            return res.status(200).json({
                success:false,
                message:"User Not Registered"
            })
        }

        if(await bcrypt.compare(password,user.password)){
            const payload ={
                id:user._id,
                email:user.email
            }

            const token=  jwt.sign(payload,process.env.JWT_SECRET_KEY,{
                expiresIn:"10000s"
            })

            user.password=undefined
            user.token=token

            const options={
                expiresIn : new Date(Date.now()+ 60*1000),
                httpOnly : true
            }

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                data:user,
                message:"Logged in Successfully"
            })
        }
        else{
            return res.status(201).json({
                success:false,
                message:"Wrong Password"
            })
        }
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed To login due to : ${error.message}`
        })
    }
}

exports.signUp = async(req,res)=>{
    try{
        const {email,firstName,lastName,password,confirmPassword,generatedOTP,providedOTP} = req.body;
        console.log("all details",req.body)
    if(!email || ! firstName || !lastName || !password || !confirmPassword || !generatedOTP || !providedOTP){
        return res.status(400).json({
            success:false,
            message:"Please provide all the neccessary Details"
        })
    }

    if(password!=confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password & confirmPassword Not Matched"
        })
    }

    const user = await User.findOne({email});

    if(user){
        return res.status(400).json({
            success:false,
            message:"User Already Registered"
        }) 
    }

    if(generatedOTP!=providedOTP){
        return res.status(400).json({
            success:false,
            message:"OTP not matched"
        })
    }

    const hashPassword = await bcrypt.hash(password,10);

    const profile = await Profile.create({
        about:null,
        gender:null,
        dob:null,
    })

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password:hashPassword,
        additionalDetails:profile._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    return res.status(200).json({
        success:true,
        message:"SignUp SuccessFully",
        data:newUser
    })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed to create account due to : ${error.message}`
        })
    }

}

exports.sendOTP=async(req,res)=>{
    try{
        const {email,otp}=req.body;
        if(!email || !otp){
            return res.status(200).json({
                success:false,
                message:"Please Provide All details"
            })
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(200).json({
                success:false,
                message:"User Already registerd"
            })
        }

        // const otp = Math.floor(Math.random() * 9999);

            const mailres = await mailSender(email,"Verification Email From Chat App",`Your Email verifiaction otp is : ${otp}`)

            return res.status(200).json({
                success:true,
                message:"OTP Sent Successfully"
            })

        

    } catch(error){
        return res.status(400).json({
            success:false,
            message:`Failed to Send OTP: ${error.message}`
        })
    }
}

exports.updatePassword = async(req,res)=>{
    try{
        const userDetail =await User.findById(req.user.id) 
        const {oldPassword,newPassword}= req.body;
        if(oldPassword == newPassword){
            return res.status(400).json({
                success:false,
                message:"Old and New Password are Same Change This"
            })
        }

        if(await bcrypt.compare(oldPassword,userDetail.password)){
            const hashPassword = await bcrypt.hash(newPassword,10);
            const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,{password:hashPassword},{new:true})

            try{
                const res = await mailSender(userDetail.email,"From Chat-App","Your password is updated successfully")
            } catch(error){
                return res.status(400).json({
                    success:false,
                    message:"Password Updated But Error in Mail Sent"
                })
            }
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Old Password Is Incorrect"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Password Updated Successfully"
        })
    } catch(error){
        return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}