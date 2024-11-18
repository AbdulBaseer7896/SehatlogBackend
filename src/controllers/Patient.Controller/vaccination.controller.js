import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { vaccination } from "../../models/Vaccines.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"



const insertVaccinationData = asyncHandler(async (req, res) => {

    const { vaccineName, vaccineType, firstDoseDate,
        totalDoses, upcomingDates, notes, status , description
    } = req.body

    const patientId = req.user._id

    console.log("this si the backend data = " , req.body)

    if(!patientId){
        throw new ApiError(409, "unauthorized request")
    }

    if (!vaccineName) {
        throw new ApiError(400, "VaccineName is required")
    }
    if (!totalDoses) {
        throw new ApiError(400, "Total Doses is required")
    }
    // const vaccinePic = req.files["vaccinePic"][0]?.path;
    // const vaccinePic = req.files?.["vaccinePic"]?.[0]?.path || "";
    // const documentImage = await uploadOnCloudinary(vaccinePic)


    const vaccinePic = [];
    console.log("this is the req.files , " , req.files)
    // Handle multiple file uploads
    if (req.files) {
        // If files are uploaded, process them
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage?.url) {
                vaccinePic.push(uploadedImage.url); // Push image URL to array
            }
        }
    }

    const vaccinationData = await vaccination.create({
        patientId : patientId,
        // doctorId,
        vaccineName,
        vaccineType,
        firstDoseDate,
        totalDoses,
        upcomingDates,
        notes,
        status,
        description,
        vaccinePic
    })



    const addVaccination = await vaccination.findById(vaccinationData._id)
    if (!addVaccination) {
        throw new ApiError(500, "Something went wrong while vaccination inserting!!")
    }

    return res.status(201).json(
        new ApiResponse(200, addVaccination, "vaccination added successfully!!!")
    )

})



const getPatientVaccinationData = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }


    // const PatientReportData = await report.findOne({ userId });
    const PatientVaccinationData = await vaccination.find({ patientId: userId });


    if(PatientVaccinationData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                PatientVaccinationData : PatientVaccinationData,
            },
            "Patient Profile Data sended Successfully!!!"
            )
        )
    }
}
)





export {
    insertVaccinationData,
    getPatientVaccinationData
}
