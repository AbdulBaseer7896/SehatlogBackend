import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
// import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken"


const registerUser = asyncHandler( async(req , res)=>{
    // get user details from frontend
    // Validation not empty
    // check if user already exists
    // check for images, check for avatar
    // upload them to cloudinary , avatar
    // create user object  - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, email, userName, userRole,  password} = req.body;
    console.log(fullName, email, userName , password , userRole);

    if(
        [fullName , email , userName , password , userRole].some((field)=> field?.trim()=== "")
    )
    {
        throw new ApiError(400 , "All fields required")
    }

    const existedUser = await  User.findOne({
        $or : [{userName} , {email}]
    })

    if(existedUser) {
        throw new ApiError(409 , "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400 , "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        userRole,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500 , "Something went wrong while registering the user!!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User Registered Successfully!!!")
    )
})

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new Error(500 , "something went wrong while generating refresh and  access token")
    }
}

const loginUser = asyncHandler( async(req, res)=>{
    // get user details from frontend
    // username or email
    // find the user
    // password check
    // access and refresh token
    // return response
    // send cookies

    const {username, email, password} = req.body;
    console.log(username, email, password);
    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{userName: username}, {email: email}]
    })

    if(!user){
        throw new ApiError(404, "Invalid username or email")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid user Credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(200, {
            user : loggedInUser,
            accessToken,
            refreshToken
        },
        "User Logged In Successfully!!!"
        )
    )
})



const logoutUser = asyncHandler( async(req, res) => {
    
    console.log("This is logoutUser")
    await User.findByIdAndUpdate(
        req.user._id , {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )


    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200, {} , "user Logged out successfully"))
})


const refreshAccessToken = asyncHandler( async(req , res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken){
        throw new ApiError(401 , "unauthenticated request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(404, "Invalid refresh token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken){ 
            throw new ApiError(404, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure: true
        }
    
        const {accessToken , newRefreshToken} = await  generateAccessAndRefreshToken(user._id)
    
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh token")
    }
    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , newRefreshToken , options)
    json(
        new ApiResponse(200, {
            user : user,
            accessToken,
            refreshToken: newRefreshToken
        },
        "Access token refreshed successfully!!!"
        )
    )

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid current password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password updated successfully")
    )
    console.log(currentPassword, newPassword);
})



const getCurrentUser = asyncHandler(async (req , res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "current user fetched successfully"))
})



const updateAccountDetails = asyncHandler(async (req , res)=>{
    const {fullName , email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "Full name and email are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
        }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 ,user , "Account details updated successfully" ))
})


const updateUserAvatar = asyncHandler(async (req, res) => {

    req.avatarLocalPath = req.file?.path

    if(!req.avatarLocalPath){
        throw new ApiError(400 , "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(req.avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400 , "Failed to upload avatar to cloudinary")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
        }
        },
        {new:true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200 , User , "Avatar updated successfully" )
    )

})


const updateUserCoverImage = asyncHandler(async (req, res) => {

    req.coverImageLocalPath = req.file?.path

    if(!req.coverImageLocalPath){
        throw new ApiError(400 , "cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(req.coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400 , "Failed to upload cover Image to cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
        }
        },
        {new:true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200 , user , "Cover Image updated successfully" )
    )

})



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}