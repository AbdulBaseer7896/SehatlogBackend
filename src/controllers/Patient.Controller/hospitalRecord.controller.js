import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { hospitalRecord } from "../../models/hospitalRecord.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"



const addHospitalRecord = asyncHandler(async (req, res) => {

    const {  hospitalName, dateOfAdmission, dateOfDischarge,
        admissionNotes ,dischargeNotes  , status , description
    } = req.body

    console.log("this is the req.body  = " , req.body)

    const patientId = req.user._id

    if(!patientId ){
        throw new ApiError(409, "unauthorized request")
    }

    if (!hospitalName) {
        throw new ApiError(400, "Hospital Name is required")
    }
    // const DocumentsPic = req.files["hospitalDocumentsPic"][0]?.path;
    // const DocumentsPic = req.files?.["hospitalDocumentsPic"]?.[0]?.path || ""
    // const documentImage = await uploadOnCloudinary(DocumentsPic)

    const hospitalDocumentsPic = [];
    // Handle multiple file uploads
    if (req.files) {
        // If files are uploaded, process them
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage?.url) {
                hospitalDocumentsPic.push(uploadedImage.url); // Push image URL to array
            }
        }
    }



    const hospitalData = await hospitalRecord.create({
        patientId : patientId,
        hospitalName,
        dateOfAdmission,
        dateOfDischarge,
        admissionNotes,
        dischargeNotes,
        status,
        description,
        hospitalDocumentsPic,
    })



    const hospitalRecordData = await hospitalRecord.findById(hospitalData._id)
    if (!hospitalRecordData) {
        throw new ApiError(500, "Something went wrong while hospital Record inserting!!")
    }

    return res.status(201).json(
        new ApiResponse(200, hospitalRecordData, "Hospital Record added successfully!!!")
    )

})




const getPatientHospitalData = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }


    // const PatientHospitalData = await report.findOne({ userId });
    const PatientHospitalData = await hospitalRecord.find({ patientId: userId });
    if(PatientHospitalData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                PatientHospitalData : PatientHospitalData,
            },
            "Patient Profile Data sended Successfully!!!"
            )
        )
    }
})

export {
    addHospitalRecord,
    getPatientHospitalData
}
