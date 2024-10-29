import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { DoctorInformation } from "../models/doctor.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"


const insertDoctorDetails = asyncHandler(async (req, res) => {
    const {
        cnicNumber,
        phoneNumber,
        gender,
        homeAddress,
        workingAddress,
        dateOfBirth,
        country,
        nationality,
        city,
        experienceYears,
        affiliatedHospitals,
        consultationFee,
        languagesSpoken,
        medicalLicense,
        ratings,
        biography,
        status,
        availableSchedule,
    } = req.body;

    const userId = req.user._id

    console.log("this is the user = " , req.user)

    if(!userId){
        throw new ApiError(401, "Not authenticated request token");
    }

    // Check if the doctor with the same CNIC or phone number already exists
    const existingDoctor = await DoctorInformation.findOne({
        $or: [{ cnicNumber }, { phoneNumber }]
    });

    if (existingDoctor) {
        throw new ApiError(409, "Doctor with this CNIC or phone number already exists");
    }


    // Create new doctor details
    const doctor = new DoctorInformation({
        userId,
        cnicNumber,
        phoneNumber,
        gender,
        homeAddress,
        workingAddress,
        dateOfBirth,
        country,
        nationality,
        city,
        experienceYears,
        affiliatedHospitals,
        consultationFee,
        languagesSpoken,
        medicalLicense,
        ratings,
        biography,
        status,
        availableSchedule,
    });

    // Save the doctor to the database
    await doctor.save();

    // Send response
    return res.status(201).json(
        new ApiResponse(201, doctor, "Doctor information added successfully")
    );
});



export {
    insertDoctorDetails,
};
