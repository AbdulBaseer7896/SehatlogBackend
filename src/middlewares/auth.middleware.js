import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"



// export const verifyJWT = asyncHandler(async(req , res , next)=>{
//     console.log("This is JWT ")
//     try {
//         console.log(req.cookies)
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
//         console.log("this si the token = " + token)
    
//         if(!token){
//             throw new ApiError(401 ,"Not authenticated request token")
//         }
    
//         const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
//         if(!user){
//             throw new ApiError(401 ,"Not authenticated request token")
//         }

//         req.user = user
//         next()
//     } catch (error) {
//         throw new ApiError(401 , error?.message || "Invalid access token")
//     }

// })  




export const verifyJWT = asyncHandler(async (req, res, next) => {
    console.log("This is the verifyJwT")
    try {
        // Check for token in cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log("This is a token " + token);

        if (!token) {
            throw new ApiError(401, "Authentication token missing");
        }

        const thiss = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzMyNGNhMzFhYjQxM2QwZTVlZDFkMGIiLCJlbWFpbCI6InBlcnNvbjFAdGVzdC5jb20iLCJwaG9uZSI6IjAzMTU1ODQ5MDUyIiwiZnVsbE5hbWUiOiJRYXppIEFsaSIsInVzZXJSb2xlIjoiUGF0aWVudCIsImlhdCI6MTczMTQzMzE2MiwiZXhwIjoxNzMxNTE5NTYyfQ.7RuKwIkvwJc2V1TsktZhWkyeGuYpFzP2Z7DkuXTUJtY"
        // Decode the token using the secret key
        const decodedToken = jwt.verify(thiss, process.env.ACCESS_TOKEN_SECRET);
        console.log("this is the decoded token" , decodedToken);

        // Find the user in the database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }

        // Attach user to the request object
        req.user = user;
        console.log("its is ended = " , req.user);
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        next(new ApiError(401, error.message || "Invalid access token"));
    }
});
