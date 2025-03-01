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




// export const verifyJWT = asyncHandler(async (req, res, next) => {
//     try {
//         // Check for token in cookies or Authorization header
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
//         console.log("Extracted token:", token);

//         if (!token) {
//             throw new ApiError(401, "Authentication token missing");
//         }
//         // Decode the token using the secret key
//         console.log("this is step 1")
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         console.log("this is step 2")
//         // Find the user in the database
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

//         console.log("this is the token key = " , process.env.ACCESS_TOKEN_SECRET)
//         if (!process.env.ACCESS_TOKEN_SECRET) {
//             console.error("Access token secret is missing in environment variables.");
//             throw new ApiError(500, "Server misconfiguration. Please contact support.");
//         }
        

//         if (!user) {
//             throw new ApiError(401, "User not authenticated");
//         }

//         // Attach user to the request object
//         req.user = user;
//         console.log("its is verify jwt next");
//         next();
//     } catch (error) {
//         console.error("JWT Verification Error:", error.message);
//         next(new ApiError(401, error.message || "Invalid access token"));
//     }
// });






export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Extracted token:", token);

        if (!token) {
            throw new ApiError(401, "Authentication token missing");
        }

        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("Access token secret is missing in environment variables.");
            throw new ApiError(500, "Server misconfiguration. Please contact support.");
        }

        // Decode the token using the secret key
        console.log("this is step 1");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("this is step 2");

        // Find the user in the database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }

        // Attach user to the request object
        req.user = user;
        console.log("its is verify jwt next");
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        if (error.name === "TokenExpiredError") {
            // Handle token expiration
            console.error("Token expired at:", error.expiredAt);
            next(new ApiError(401, "Token expired"));
        } else {
            // Handle other JWT-related errors
            next(new ApiError(401, error.message || "Invalid access token"));
        }
    }
});




