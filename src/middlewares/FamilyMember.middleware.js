

import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


export const verifyFamilyRelationship = asyncHandler(async (req, res, next) => {
    console.log("This is the Verify  of the Family M")
    if (req.user.userRole === "FamilyMember") {
        const relationship = await myFamily.findOne({
            familyMemberUserId: req.user._id,
            patientId: req.params.patientId
        });
        
        if (!relationship) {
            throw new ApiError(403, "Not authorized for this patient");
        }
    }
    next();
});