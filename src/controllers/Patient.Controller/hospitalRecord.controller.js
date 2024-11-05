import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { hospitalRecord } from "../../models/hospitalRecord.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"



const addHospitalRecord = asyncHandler(async (req, res) => {

    const { doctorId, hospitalName, dataOfAdmission, dataOfDischarge,
        admissionNotes, status
    } = req.body

    const patientId = req.user._id

    if(!patientId ){
        throw new ApiError(409, "unauthorized request")
    }

    if (!hospitalName) {
        throw new ApiError(400, "Hospital Name is required")
    }
    // const DocumentsPic = req.files["otherDocumentsImages"][0]?.path;
    const DocumentsPic = req.files?.["otherDocumentsImages"]?.[0]?.path || ""
    const documentImage = await uploadOnCloudinary(DocumentsPic)


    const hospitalData = await hospitalRecord.create({
        patientId : patientId,
        doctorId,
        hospitalName,
        dataOfAdmission,
        dataOfDischarge,
        admissionNotes,
        status,
        otherDocumentsImages: documentImage?.url || "",
    })



    const hospitalRecordData = await hospitalRecord.findById(hospitalData._id)
    if (!hospitalRecordData) {
        throw new ApiError(500, "Something went wrong while hospital Record inserting!!")
    }

    return res.status(201).json(
        new ApiResponse(200, hospitalRecordData, "Hospital Record added successfully!!!")
    )

})

export {
    addHospitalRecord,
}
