

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { report } from "../../models/report.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const addReportRecord = asyncHandler(async (req, res) => {
    const { reportName, reportType, reportDate, findings, testName, resultValue, 
        units, referenceRange, description, notes, status,} = req.body;

    const patientId = req.user._id;

    if (!patientId) {
        throw new ApiError(409, "Unauthorized request");
    }
    if (!reportName) {
        throw new ApiError(400, "Report Name is required");
    }
    const reportPics = [];
    // Handle multiple file uploads
    if (req.files) {
        // If files are uploaded, process them
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage?.url) {
                reportPics.push(uploadedImage.url); // Push image URL to array
            }
        }
    }
    // Create the report record
    const reportData = await report.create({ patientId: patientId, reportName, reportType, 
        reportDate, findings, testName, resultValue, units, referenceRange,
         description, notes, status, reportPics,  // Store the array of image URLs or an empty array if no images were uploaded
    });

    if (!reportData) {
        throw new ApiError(500, "Something went wrong while inserting the report!");
    }

    return res.status(201).json(
        new ApiResponse(200, reportData, "Report added successfully!")
    );
});





const getPatientReportData = async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }

    console.log("User Id: " + userId)

    // const PatientReportData = await report.findOne({ userId });
    const PatientReportData = await report.find({ patientId: userId });

    console.log("this is the patient report = " , PatientReportData)

    if(PatientReportData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                PatientProfileData : PatientReportData,
            },
            "Patient Profile Data sended Successfully!!!"
            )
        )
    }
}
export { 
    addReportRecord ,
    getPatientReportData
};
