import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"



export const isPatientAuth = asyncHandler(async(req , res , next)=>{
    console.log("This is patient Auth ")
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
    
        if(!token){
            throw new ApiError(401 ,"Not authenticated request token")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401 ,"Not authenticated request token")
        }

        if(user.userRole !== "Patient"){
            throw new ApiError(403 ,"Unauthorized to access this route just patient allowed")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid access token")
    }

})  