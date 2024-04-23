const express = require("express")
const router = express.Router()
const {auth}  = require("../middleware/auth")

const {updateImage,updateProfile,deleteAccount,getAllUser,userDetails} = require("../controller/profile")

router.post("/update-profile",auth,updateProfile)
router.post("/update-image",auth,updateImage)
router.post("/delete-account",auth,deleteAccount)
router.get("/get-all-user",auth,getAllUser)
router.get("/user-details",auth,userDetails)
module.exports = router