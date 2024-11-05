import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { prescription } from "../../models/prescription.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"



const addPrescriptionRecord = asyncHandler(async (req, res) => {

    const { doctorId, AppointmentID,  prescriptionName , medications
        ,  date , notes , status 
    } = req.body

    const patientId = req.user._id

    if(!patientId ){
        throw new ApiError(409, "unauthorized request")
    }

    if (!prescriptionName) {
        throw new ApiError(400, "prescriptionName Name is required")
    }
    // const DocumentsPic = req.files["prescriptionImages"][0]?.path;
    const DocumentsPic = req.files?.["prescriptionImages"]?.[0]?.path || ""
    const documentImage = await uploadOnCloudinary(DocumentsPic)


    const hospitalData = await prescription.create({
        patientId : patientId,
        doctorId,
        AppointmentID,
        prescriptionName,
        medications,
        date,
        notes,
        status,
        prescriptionImages: documentImage?.url || "",
    })



    const prescriptionData = await prescription.findById(hospitalData._id)
    if (!prescriptionData) {
        throw new ApiError(500, "Something went wrong while prescription Record inserting!!")
    }

    return res.status(201).json(
        new ApiResponse(200, prescriptionData, "Prescription Record added successfully!!!")
    )

})

export {
    addPrescriptionRecord,
}
