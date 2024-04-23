const express = require("express")
const router = express.Router()
const {auth}  = require("../middleware/auth")

const {createPost,deletePost,addComment,deleteComment,likePost,fetchAllPost} = require("../controller/post")

router.post("/create-post",auth,createPost)
router.post("/delete-post",auth,deletePost)
router.post("/add-comment",auth,addComment)
router.post("/delete-comment",auth,deleteComment)
router.post("/like-post",auth,likePost)
router.get("/fetch-all-posts",auth,fetchAllPost)

module.exports = router
