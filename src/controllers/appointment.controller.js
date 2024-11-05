import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const appointmentBooking = asyncHandler(async (req , res)=>{
    const { 
        doctorId,
        appointmentDate,
        appointmentTime,
        reason,
        symptoms,
        medication,
        diagnosis,
        prescription,
        comments,
        notes
     } = req.body

    const patientId = req.user._id

    if(!patientId){
        throw new ApiError(409, "unauthorized request")
    }


    // const checkAppointmentSlot = await DoctorInformation.findOne({
    //     $and:[{appointmentDate} , {appointmentTime}]
    // })

    const checkAppointmentSlot = await Appointment.findOne({
        doctorId,
        appointmentDate,
        appointmentTime
    });
    

    if(checkAppointmentSlot){
        throw new ApiError(409, "Slot already booked for the given date and time")
    }

    const documentLocalPath = req.files?.document[0]?.path || "";
    // const documentLocalPath = req.files?.["document"]?.[0]?.path || "";

     // Validate inputs
    if(!patientId ||!doctorId || !appointmentDate || !appointmentTime ){
        throw new ApiError(400, "All fields are required")
    }


    const documentImage = await uploadOnCloudinary(documentLocalPath)


    const appointment = await Appointment.create({
        doctorId,
        patientId,
        appointmentDate,
        appointmentTime,
        reason,
        symptoms,
        medication,
        diagnosis,
        prescription,
        comments,
        notes,
        documentImage: documentImage?.url || "",
    })

    const addAppointment = await Appointment.findById(appointment._id)
    if(!addAppointment) {
        throw new ApiError(500 , "Something went wrong while appointment booking!!")
    }

    return res.status(201).json(
        new ApiResponse(200, addAppointment , "Appointment booked Successfully!!!")
    )

})

export { 
    appointmentBooking,
}
