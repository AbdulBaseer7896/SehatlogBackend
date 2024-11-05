import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { vaccination } from "../../models/Vaccines.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"



const insertVaccinationData = asyncHandler(async (req, res) => {

    const { doctorId, vaccineName, vaccineType, dataAdministered,
        totalDoses, nextDueDate, notes, status
    } = req.body

    const patientId = req.user._id

    if(!patientId){
        throw new ApiError(409, "unauthorized request")
    }

    if (!vaccineName) {
        throw new ApiError(400, "VaccineName is required")
    }
    // const vaccinationPic = req.files["vaccinationPic"][0]?.path;
    const vaccinationPic = req.files?.["vaccinationPic"]?.[0]?.path || "";
    const documentImage = await uploadOnCloudinary(vaccinationPic)


    const vaccinationData = await vaccination.create({
        patientId : patientId,
        doctorId,
        vaccineName,
        vaccineType,
        dataAdministered,
        totalDoses,
        nextDueDate,
        notes,
        status,
        vaccinationPic: documentImage?.url || "",
    })



    const addVaccination = await vaccination.findById(vaccinationData._id)
    if (!addVaccination) {
        throw new ApiError(500, "Something went wrong while vaccination inserting!!")
    }

    return res.status(201).json(
        new ApiResponse(200, addVaccination, "vaccination added successfully!!!")
    )

})

export {
    insertVaccinationData,
}
