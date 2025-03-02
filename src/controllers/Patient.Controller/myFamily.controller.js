

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { myFamily } from "../../models/myFamily.model.js";
import { User } from "../../models/user.model.js";
import { generateAccessAndRefreshToken } from "../user.controller.js";


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


const switchToPersonal = asyncHandler(async (req, res) => {
    try {
    
        const userId = req.user._id;
        console.log("This is the userId = " , userId)

        // // 1. Find the family relationship with populated user data
        const familyMember = await myFamily.findOne({
            familyMemberUserId: userId
        })
        console.log("This is the member = " , familyMember)

        if (!familyMember || !familyMember.familyMemberUserId) {
            return res.status(404).json({ 
                success: false,
                message: "Family member not found" 
            });
        }

        // // 2. Get the actual user document
        const targetUser = await User.findById(familyMember.patientId)
            .select("-password -refreshToken");

        console.log("This is the main user = " , targetUser)

        // // 3. Generate tokens for the FAMILY MEMBER USER
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(targetUser._id);
        console.log("test 5")

        // // 4. Prepare proper response
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
                message: "Profile switched To Person Profile successfully",
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
    switchToFamilyMember,
    switchToPersonal
};
