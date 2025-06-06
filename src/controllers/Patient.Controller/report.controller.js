

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { report } from "../../models/report.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const addReportRecord = asyncHandler(async (req, res) => {
    const { reportName, reportType, reportDate, labName, findings, tests, description, notes, status } = req.body;
    let testsArray = [];
    const patientId = req.user._id;

    if (!patientId) {
        throw new ApiError(409, "Unauthorized request");
    }
    if (!reportName) {
        throw new ApiError(400, "Report Name is required");
    }
    const reportPics = [];

    try {
        testsArray = JSON.parse(tests || "[]");
    } catch (error) {
        throw new ApiError(400, "Invalid tests format");
    }
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
    const reportData = await report.create({
        patientId,
        reportName,
        reportType,
        reportDate,
        labName,
        findings,
        tests: testsArray, // Store parsed tests array
        description,
        notes,
        status,
        reportPics,
    });

    if (!reportData) {
        throw new ApiError(500, "Something went wrong while inserting the report!");
    }

    return res.status(201).json(
        new ApiResponse(200, reportData, "Report added successfully!")
    );
});





const getPatientReportData = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }


    // const PatientReportData = await report.findOne({ userId });
    const PatientReportData = await report.find({ patientId: userId });


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
})
export { 
    addReportRecord ,
    getPatientReportData
};
