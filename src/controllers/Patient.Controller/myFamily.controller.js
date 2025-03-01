

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { myFamily } from "../../models/myFamily.model.js";
import { User } from "../../models/user.model.js";
import { generateAccessAndRefreshToken } from "../user.controller.js";

// const addFamilyMember = asyncHandler(async (req, res) => {
//     const { fullName, relationship, dateOfBirth, gender } = req.body;
//     console.log("this is that data = " , fullName , relationship , dateOfBirth , gender)

//     const patientId = req.user._id;
//     console.log("this is import to see = " , req.user)

//     if (!patientId) {
//         throw new ApiError(409, "Unauthorized request");
//     }
//     if (!fullName || !relationship || !dateOfBirth  || !gender) {
//         throw new ApiError(400, "Data is required");
//     }
//     // Create the report record
//     const emailParts = req.user.email.split("@"); // Split email at @
//     const sanitizedFullName = fullName.replace(/\s+/g, "");
//     const familyEmail = `${emailParts[0]}_M_${relationship}_${sanitizedFullName}@${emailParts[1]}`;
    
//     const familyPhone = req.user.phone
//     const FamilyMemeberUserRole = 'FamilyMemeber'
//     const user = await User.create({
//         fullName: fullName,
//         email:familyEmail,
//         phone:familyEmail,
//         userRole:FamilyMemeberUserRole,
//         password:familyEmail,
//     })
//     const familyData = await myFamily.create({patientId, fullName, relationship, dateOfBirth, gender });
    
//     const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken"
//     )

//     if(!createdUser) {
//         throw new ApiError(500 , "Something went wrong while registering the user!!")
//     }

//     if (!familyData) {
//         throw new ApiError(500, "Something went wrong while adding Family Member!");
//     }

//     return res.status(201).json(
//         new ApiResponse(200, familyData, "Family Member added successfully!")
//     );
// });

const addFamilyMember = asyncHandler(async (req, res) => {
    const { fullName, relationship, dateOfBirth, gender } = req.body;
    const patientId = req.user._id;

    // Validate inputs
    if (!patientId) throw new ApiError(409, "Unauthorized request");
    if (!fullName || !relationship || !dateOfBirth || !gender) {
        throw new ApiError(400, "All fields are required");
    }

    // Create family member user
    const emailParts = req.user.email.split("@");
    const sanitizedFullName = fullName.replace(/\s+/g, "");
    const familyEmail = `${emailParts[0]}_M_${relationship}_${sanitizedFullName}@${emailParts[1]}`;
    
    // Create the family member user
    const familyUser = await User.create({
        fullName,
        email: familyEmail,
        phone: familyEmail, // Or generate unique phone if needed
        userRole: 'FamilyMember', // Fixed typo
        password: familyEmail // Consider generating a random password
    });

    // Create the family relationship record
    const familyData = await myFamily.create({
        patientId,
        familyMemberUserId: familyUser._id, // Link to new user
        fullName,
        relationship,
        dateOfBirth,
        gender
    });

    // Verify creation
    if (!familyUser || !familyData) {
        await User.deleteOne({ _id: familyUser._id }); // Cleanup if failed
        throw new ApiError(500, "Failed to create family member");
    }

    return res.status(201).json(
        new ApiResponse(200, {
            familyMember: familyData,
            user: await User.findById(familyUser._id).select("-password -refreshToken")
        }, "Family Member added successfully!")
    );
});



const getFamilyMemberData = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    console.log("this is the id = " , userId)

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }


    // const PatientReportData = await report.findOne({ userId });
    const FamilyMemberData = await myFamily.find({ patientId: userId });


    if(FamilyMemberData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                FamilyMemberData : FamilyMemberData,
            },
            "Family Member Data sended Successfully!!!"
            )
        )
    }
}
)


// const switchToFamilyMember = asyncHandler(async (req, res) => {
//         try {
//     const { familyMemberId } = req.body;
//     console.log("this is the id = " , familyMemberId)
//     const userId = req.user._id; // Logged-in user ID from auth middleware
//     console.log("this is the test 1")

//     // Check if the family member exists and belongs to the user
//     const familyMember = await myFamily.findOne({
//         _id: familyMemberId,
//         patientId: userId
//     });

//     console.log("this si the familyMember, " , familyMember)
//     console.log("this is the test 2")


//     if (!familyMember) {
//         return res.status(404).json({ error: "Family member not found or does not belong to you" });
//     }

//     console.log("this is the test 3")

//     // Fetch the family member's user data
//     // let familyUser = await User.findOne({ _id: familyMemberId });

    
//     // console.log("this si the familyMember, " , familyUser)
//     console.log("this is the test 4")

//     // if (!familyUser) {
//     //     // If a user record does not exist, create a temporary one
//     //     console.log("this is the test 5")
//     //     familyUser = new User({
//     //         _id: familyMemberId,
//     //         email: familyMember.email, // Temporary email
//     //         fullName: familyMember.fullName,
//     //         password: "dummyPassword", // Won't be used
//     //         userRole: "FamilyMemeber",
//     //     });

//     //     await familyUser.save();
//     // }
//     // console.log("this is the test 6")


//     // Generate new access and refresh tokens for the family member
//     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(familyMember.familyMemberUserId);
//     console.log("this is the test 7")
    
//     // Set cookies with new tokens
//     const options = {
//         httpOnly: true,
//         secure: true
//     };
    
//     console.log("this is the test 1")
//     return res
//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json({
//             success: true,
//             message: "Profile switched successfully",
//             user: {
//                 _id: familyMember._id,
//                 fullName: familyMember.fullName,
//                 userRole: familyMember.userRole
//             },
//             accessToken,
//             refreshToken
//         });
//         } catch (error) {
//             console.log("this is the errro ")
//             console.error("Error switching profile:", error);
//             return res.status(500).json({
//                 success: false,
//                 error: "An internal server error occurred. Please try again later."
//             });
//         }
//     });

const switchToFamilyMember = asyncHandler(async (req, res) => {
    try {
        const { familyMemberId } = req.body;
        const userId = req.user._id;

        // 1. Find the family relationship with populated user data
        const familyMember = await myFamily.findOne({
            _id: familyMemberId,
            patientId: userId
        }).populate('familyMemberUserId');

        if (!familyMember || !familyMember.familyMemberUserId) {
            return res.status(404).json({ 
                success: false,
                message: "Family member not found" 
            });
        }

        // 2. Get the actual user document
        const targetUser = await User.findById(familyMember.familyMemberUserId._id)
            .select("-password -refreshToken");

        // 3. Generate tokens for the FAMILY MEMBER USER
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(targetUser._id);

        // 4. Prepare proper response
        const responseData = {
            user: targetUser,
            accessToken,
            refreshToken
        };

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json({
                success: true,
                message: "Profile switched successfully",
                data: responseData // Properly structured response
            });

    } catch (error) {
        console.error("Switch error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Switch failed"
        });
    }
});

export { 
    getFamilyMemberData,
    addFamilyMember,
    switchToFamilyMember
};
