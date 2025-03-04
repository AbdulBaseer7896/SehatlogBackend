import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { prescription } from "../../models/prescription.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { Appointment } from "../../models/appointment.model.js";



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



// router.get('/patient/:patientId', auth, async (req, res) => {
    
const getPrescriptionRecord = asyncHandler(async (req, res) => {

    const patientId = req.user._id
    console.log("this working , " , patientId)
    if (!patientId) {
        throw new ApiError(400, "Patient Id is required");
    }
    try {
        console.log("its started")
      const prescriptions = await Appointment.find({ patientId: patientId})
        // .populate('doctorId')
        // .sort({ date: -1 });
  
        // console.log("this si workign = " , prescriptions)
      res.json({ success: true, data: prescriptions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

export {
    addPrescriptionRecord,
    getPrescriptionRecord
}
