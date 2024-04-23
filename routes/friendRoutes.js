const express = require("express")
const router = express.Router()
const {auth}  = require("../middleware/auth")

const {manageFriendRequest,requestAccept,unFriend,requestReject} = require("../controller/friends")

router.post("/accept-request",auth,requestAccept)
router.post("/manage-friend-request",auth,manageFriendRequest)
router.post("/reject-request",auth,requestReject)
router.post("/unfriend",auth,unFriend)

module.exports = router