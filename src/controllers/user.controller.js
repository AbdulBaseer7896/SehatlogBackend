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

    const {fullName, email,phone, userRole,  password} = req.body;
    console.log(fullName, email ,phone , password , userRole);

    if(
        [fullName , email ,phone , password , userRole].some((field)=> field?.trim()=== "")
    )
    {
        throw new ApiError(400 , "All fields required")
    }

    const existedUser = await  User.findOne({
        $or : [{phone} , {email}]
    })

    if(existedUser) {
        return res.status(201).json(
            new ApiError(409 , "User already exists" , "user already exists")
        )
    }

    const user = await User.create({
        fullName,
        email,
        phone,
        userRole,
        password,
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
    //  email
    // find the user
    // password check
    // access and refresh token
    // return response
    // send cookies

    const { email, password} = req.body;
    console.log( email, password);
    if(!email){
        return res.status(201).json(
            new ApiError(400, "email is required", "email is required")
        )
    }

    const user = await User.findOne({
        $or: [ {email: email}]
    })

    if(!user){
        return res.status(201).json(
            new ApiError(404, "Invalid  email", "Invalid  email")
        )
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        return res.status(201).json(
            new ApiError(404, "Invalid user Credentials", "Invalid user Credentials")
        )
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


// const refreshAccessToken = asyncHandler( async(req , res)=>{
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

//     if (!incomingRefreshToken){
//         throw new ApiError(401 , "unauthenticated request")
//     }

//     try {
//         const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
    
//         const user = await User.findById(decodedToken?._id)
    
//         if(!user){
//             throw new ApiError(404, "Invalid refresh token")
//         }
        
//         if(incomingRefreshToken !== user?.refreshToken){ 
//             throw new ApiError(404, "Refresh Token is expired or used")
//         }
    
//         const options = {
//             httpOnly : true,
//             secure: true
//         }
    
//         const {accessToken , newRefreshToken} = await  generateAccessAndRefreshToken(user._id)
    
//     } catch (error) {
//         throw new ApiError(401 , error?.message || "Invalid refresh token")
//     }
//     return res
//         .status(200)
//         .cookie("accessToken" , accessToken , options)
//         .cookie("refreshToken" , newRefreshToken , options)
//             json(
//                 new ApiResponse(200, {
//                     user : user,
//                     accessToken,
//                     refreshToken: newRefreshToken
//                 },
//                 "Access token refreshed successfully!!!"
//                 )
//             )

// })



const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;


    console.log("this is the refresh token " , incomingRefreshToken)
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthenticated request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(404, "Invalid refresh token");
        }

        console.log("this is the refresh token" , user?.refreshToken)

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(404, "Refresh token has expired or been used");
        }

        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzMyNGNhMzFhYjQxM2QwZTVlZDFkMGIiLCJ1c2VyUm9sZSI6IlBhdGllbnQiLCJpYXQiOjE3MzE1Mjg4ODQsImV4cCI6MTczMjM5Mjg4NH0.yKv9o8cfx6z_f3u-pKZfAFut5JpTfrSFcqwINOx1IkE

        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzMyNGNhMzFhYjQxM2QwZTVlZDFkMGIiLCJlbWFpbCI6InBlcnNvbjFAdGVzdC5jb20iLCJwaG9uZSI6IjAzMTU1ODQ5MDUyIiwiZnVsbE5hbWUiOiJRYXppIEFsaSIsInVzZXJSb2xlIjoiUGF0aWVudCIsImlhdCI6MTczMTQzMzE2MiwiZXhwIjoxNzMxNTE5NTYyfQ.7RuKwIkvwJc2V1TsktZhWkyeGuYpFzP2Z7DkuXTUJtY
        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzMyNGNhMzFhYjQxM2QwZTVlZDFkMGIiLCJ1c2VyUm9sZSI6IlBhdGllbnQiLCJpYXQiOjE3MzE0Mjg2MzcsImV4cCI6MTczMjI5MjYzN30.6dqZorEI-PXHYB0EXXLLO4glMIoiYk9GftDIeafuz0I
        const options = {
            httpOnly: true,
            secure: true, // ensure you are in a secure environment (https)
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        // Update user's refresh token in the database (if you want to track it)
        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, {
                user: user,
                accessToken,
                refreshToken: newRefreshToken
            }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});


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


    console.log("This is updateUserAvatar req.file" , req.file)
    console.log("This is updateUserAvatar req.file.path" , req.file.path)
    req.avatarLocalPath = req.file?.path



    if (!req.file || !req.file.path) {
        throw new ApiError(400, "Avatar file is missing");
    }

    console.log("This is the avatar path " , req.avatarLocalPath)
    // if(!req.avatarLocalPath){
    //     throw new ApiError(400 , "Avatar file is missing")
    // }

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
    console.log("This is th update for cover image")

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