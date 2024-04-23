const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser")
const {dbconnect}=require("./config/dbConnect")
const {cloudinaryConnect} = require("./config/cloudinaryConnect")
const userRoute = require("./routes/userRoutes")
const profileRoute = require("./routes/profileRoute")
const friendRoute = require("./routes/friendRoutes")
const postRoute = require("./routes/postRoutes")
const fileUpload = require("express-fileupload")
const cors = require("cors")

dbconnect();
cloudinaryConnect();
const PORT=process.env.PORT;
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin:"*", 
    credentials:true
}))

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)


app.use("/api/v1/auth",userRoute)
app.use("/api/v1/profile",profileRoute)
app.use("/api/v1/post",postRoute)
app.use("/api/v1/friendrequest", friendRoute);



app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your Server is running.........."
    })
})

app.listen(PORT,()=>{
    return(
        console.log("App is Running at : ",PORT)
    )
})
