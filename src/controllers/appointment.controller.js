import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DoctorSchedule } from "../models/doctor.model.js";


// const appointmentBooking = asyncHandler(async (req , res)=>{
//     const { 
//         doctorId,
//         appointmentDate,
//         appointmentTime,
//         reason,
//         symptoms,
//         medication,
//         diagnosis,
//         prescription,
//         comments,
//         notes
//      } = req.body

//     const patientId = req.user._id

//     if(!patientId){
//         throw new ApiError(409, "unauthorized request")
//     }


//     // const checkAppointmentSlot = await DoctorInformation.findOne({
//     //     $and:[{appointmentDate} , {appointmentTime}]
//     // })

//     const checkAppointmentSlot = await Appointment.findOne({
//         doctorId,
//         appointmentDate,
//         appointmentTime
//     });
    

//     if(checkAppointmentSlot){
//         throw new ApiError(409, "Slot already booked for the given date and time")
//     }

//     const documentLocalPath = req.files?.document[0]?.path || "";
//     // const documentLocalPath = req.files?.["document"]?.[0]?.path || "";

//      // Validate inputs
//     if(!patientId ||!doctorId || !appointmentDate || !appointmentTime ){
//         throw new ApiError(400, "All fields are required")
//     }


//     const documentImage = await uploadOnCloudinary(documentLocalPath)


//     const appointment = await Appointment.create({
//         doctorId,
//         patientId,
//         appointmentDate,
//         appointmentTime,
//         reason,
//         symptoms,
//         medication,
//         diagnosis,
//         prescription,
//         comments,
//         notes,
//         documentImage: documentImage?.url || "",
//     })

//     const addAppointment = await Appointment.findById(appointment._id)
//     if(!addAppointment) {
//         throw new ApiError(500 , "Something went wrong while appointment booking!!")
//     }

//     return res.status(201).json(
//         new ApiResponse(200, addAppointment , "Appointment booked Successfully!!!")
//     )

// })




//     const appointmentBooking = asyncHandler(async (req , res)=>{
//     const {clinicName , doctorId } = req.body;
//     const patientId = req.user?._id;

//     console.log('hello 1 ')

//     console.log("this is the req.body" , req.body);
//     console.log(clinicName, doctorId)
//     if (!doctorId || !clinicId || !date || !time || !reason || !patientId) {
//         return res.status(400).json({ message: "All fields are required" });
//     }

    

//     try {
//         // Check if slot is already booked
//         const doctorSchedule = await DoctorSchedule.findOne({
//             doctorId,
//             // "clinics._id": clinicId,
//             "clinics.bookedSlots": { $elemMatch: { date, time } }
//         });

//         console.log('hello 2 ')


//         if (doctorSchedule) {
//             return res.status(400).json({ message: "Slot already booked" });
//         }

//         // Add the booked slot to the DoctorSchedule
//         await DoctorSchedule.updateOne(
//             { doctorId },
//             { $push: { "clinics.$.bookedSlots": { date, time } } }
//         );

//         console.log('hello 3 ')


//         // Create an appointment in the Appointment collection
//         const appointment = new Appointment({
//             doctorId,
//             patientId,
//             appointmentDate: date,
//             appointmentTime: time,
//             reason,
//             status: "scheduled"
//         });

//         await appointment.save();

//         return res.status(201).json({ message: "Appointment booked successfully" });
//     } catch (error) {
//         console.error("Error booking appointment:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });




// const appointmentBooking = asyncHandler(async (req, res) => {
//     const { clinicName, doctorId, date, slot, reason, symptoms, medication, notes } = req.body;
//     const patientId = req.user?._id;

//     console.log('hello 1');

//     console.log("this is the req.body", req.body);
//     console.log(clinicName, doctorId);

//     // Check if all required fields are present
//     if (!doctorId || !clinicName || !date || !slot || !reason || !patientId) {
//         return res.status(400).json({ message: "All fields are required" });
//     }

//     try {
//         // Check if the slot is already booked for the doctor
//         const doctorSchedule = await DoctorSchedule.findOne({
//             doctorId,
//             "clinics.name": clinicName,  // Use clinicName instead of clinicId
//             "clinics.bookedSlots": { $elemMatch: { date, slot } }
//         });

//         console.log('hello 2');

//         if (doctorSchedule) {
//             return res.status(400).json({ message: "Slot already booked" });
//         }

//         // Add the booked slot to the DoctorSchedule
//         await DoctorSchedule.updateOne(
//             { doctorId, "clinics.name": clinicName },  // Use clinicName here as well
//             { $push: { "clinics.$.bookedSlots": { date, slot } } }
//         );

//         console.log('hello 3');

//         // Create an appointment in the Appointment collection
//         const appointment = new Appointment({
//             doctorId,
//             patientId,
//             appointmentDate: date,
//             appointmentTime: slot,  // Use slot here
//             reason,
//             symptoms,
//             medication,
//             notes,
//             status: "scheduled"
//         });

//         await appointment.save();

//         return res.status(201).json({ message: "Appointment booked successfully" });
//     } catch (error) {
//         console.error("Error booking appointment:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


const appointmentBooking = asyncHandler(async (req, res) => {
    const { clinicName, doctorId, date, slot, reason, symptoms, medication, notes } = req.body;
    const patientId = req.user?._id;
    console.log('hello 1');

    console.log(clinicName, doctorId, date, slot, reason, symptoms, medication, notes);

    // Extract startTime and endTime from the slot (e.g., "14:13 - 14:26")
    const [startTime, endTime] = slot.split(" - ");

    // Check if all required fields are provided, including startTime and endTime
    if (!doctorId || !clinicName || !date || !startTime || !endTime || !reason || !patientId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const doctorSchedule = await DoctorSchedule.findOne({
            doctorId,
            "clinics.name": clinicName,
            "clinics.bookedSlots": { $elemMatch: { date, time: { $in: [startTime, endTime] } } }
        });

        if (doctorSchedule) {
            return res.status(400).json({ message: "Slot already booked" });
        }

        // Update the schedule to mark the slot as booked
        await DoctorSchedule.updateOne(
            { doctorId, "clinics.name": clinicName },
            { $push: { "clinics.$.bookedSlots": { date, time: startTime } } }
        );

        // Create the appointment using startTime and endTime
        const appointment = new Appointment({
            doctorId,
            patientId,
            appointmentDate: date,
            startTime,
            endTime,
            reason,
            symptoms,
            medication,
            notes,
            status: "scheduled"
        });

        // Save the appointment
        await appointment.save();

        // return res.status(201).json({ message: "Appointment booked successfully" });

        // if(appointment){
            return res
            .status(201)
            .json(
                new ApiResponse(201, {
                    appointment : appointment,
                },
                "you Appointment is Booked sended Successfully!!!"
                )
            )
        // }
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});





export { 
    appointmentBooking,
}
