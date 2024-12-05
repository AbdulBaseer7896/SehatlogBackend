import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { DoctorInformation , DoctorSchedule } from "../../models/doctor.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


const insertDoctorDetails = asyncHandler(async (req, res) => {
    const {
        cnicNumber,
        phoneNumber,
        gender,
        homeAddress,
        workingAddress,
        DOB,
        country,
        nationality,
        city,
        experience,
        affiliatedHospitals,
        languagesSpoken,
        medicalLicense,
        ratings,
        biography,
        status,
        qualification,      // Added qualification
        specialization,     // Added specialization
        clinics,            // Added clinics
        memberships         // Added memberships
    } = req.body;

    const userId = req.user._id;

    console.log("this is the user =", req.user);

    if (!userId) {
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
        DOB,
        country,
        nationality,
        city,
        experience,
        affiliatedHospitals,
        languagesSpoken,
        medicalLicense,
        ratings,
        biography,
        status,
        qualification,         // Saving qualification
        specialization,        // Saving specialization
        clinics,               // Saving clinics
        memberships            // Saving memberships
    });

    // Save the doctor to the database
    await doctor.save();

    // Send response
    return res.status(201).json(
        new ApiResponse(201, doctor, "Doctor information added successfully")
    );
});







const getDoctorProfileData = async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }

    console.log("this si 2324")

    const DoctorProfileData = await DoctorInformation.findOne({ userId });

    console.log("this si the DoctorProfileData =  " + DoctorProfileData)

    if(DoctorProfileData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                DoctorProfileData : DoctorProfileData,
            },
            "Doctor Profile Data sended Successfully!!!"
            )
        )
    }
}


const setDoctorSchedule = asyncHandler(async (req, res) => {
    const { clinics } = req.body;
    const doctorId = req.user?._id;

    console.log("Received doctorId:", doctorId);
    console.log("Received clinics data:", JSON.stringify(clinics, null, 2));
    console.log("Received clinics data:", JSON.stringify(clinics[0].slotTime, null, 2));

    // Validate the presence of clinics
    if (!clinics || !Array.isArray(clinics) || clinics.length === 0) {
        throw new ApiError(401, "Clinics data is required and should be an array");
    }

    // Validate each clinic's structure
    clinics.forEach((clinic, index) => {
        if (!clinic?.name || !clinic?.clinicAddress || !clinic?.slotTime || !Array.isArray(clinic?.days) || 
            !clinic?.timing?.start || !clinic?.timing?.end) {
            console.error(`Invalid clinic at index ${index}:`, clinic);
            throw new ApiError(400, `Clinic at index ${index} is missing required fields`);
        }

        // Validate each break's structure
        clinic.breaks?.forEach((breakTime, breakIndex) => {
            if (!breakTime?.start || !breakTime?.end) {
                console.error(`Invalid break at index ${breakIndex} in clinic ${index}:`, breakTime);
                throw new ApiError(400, `Break at index ${breakIndex} in clinic ${index} is missing start or end time`);
            }
        });
    });

    // Upsert the schedule
    const schedule = await DoctorSchedule.findOneAndUpdate(
        { doctorId },
        { clinics },
        { upsert: true, new: true }
    );

    return res.status(200).json(new ApiResponse(200, schedule, "Doctor schedule set successfully"));
});


export {
    insertDoctorDetails,
    setDoctorSchedule,
    getDoctorProfileData
};