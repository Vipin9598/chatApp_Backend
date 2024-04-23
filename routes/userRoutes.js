const express = require("express")
const router = express.Router()
const {auth}  = require("../middleware/auth")

const {logIn,signUp,sendOTP,updatePassword} = require("../controller/auth")
const {resetPasswordToken,resetPassword} = require("../controller/resetPassword")

router.post("/login",logIn)
router.post("/signup",signUp)
router.post("/send-otp",sendOTP)
router.post("/update-password",auth,updatePassword)

router.post("/reset-password-token",resetPasswordToken)
router.post("/reset-password",resetPassword)

module.exports =router