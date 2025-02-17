


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DoctorSchedule } from "../models/doctor.model.js";

// const appointmentBooking = asyncHandler(async (req, res) => {
//     const { clinicName, doctorId, date, slot, reason, symptoms, medication, notes } = req.body;
//     const patientId = req.user?._id;

//     // Extract startTime and endTime from the slot (e.g., "14:13 - 14:26")
//     console.log("Received slot:", slot);
// if (!slot) {
//     return res.status(400).json({ message: "Slot is missing or invalid" });
// }

//     const [startTime, endTime] = slot.split(" - ");

//     // Check if all required fields are provided, including startTime and endTime
//     if (!doctorId || !clinicName || !date || !startTime || !endTime || !reason || !patientId) {
//         return res.status(400).json({ message: "All fields are required" });
//     }

//     try {
//         const doctorSchedule = await DoctorSchedule.findOne({
//             doctorId,
//             "clinics.name": clinicName,
//             "clinics.bookedSlots": { $elemMatch: { date, time: { $in: [startTime, endTime] } } }
//         });

//         if (doctorSchedule) {
//             return res.status(400).json({ message: "Slot already booked" });
//         }

//         // Update the schedule to mark the slot as booked
//         await DoctorSchedule.updateOne(
//             { doctorId, "clinics.name": clinicName },
//             { $push: { "clinics.$.bookedSlots": { date, time: startTime } } }
//         );

//         // Create the appointment using startTime and endTime
//         const appointment = new Appointment({
//             doctorId,
//             patientId,
//             appointmentDate: date,
//             startTime,
//             endTime,
//             reason,
//             symptoms,
//             medication,
//             notes,
//             status: "scheduled"
//         });

//         // Save the appointment
//         await appointment.save();

//         return res.status(201).json(
//             new ApiResponse(201, { appointment: appointment }, "Your appointment has been booked successfully!")
//         );
//     } catch (error) {
//         console.error("Error booking appointment:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });





const appointmentBooking = asyncHandler(async (req, res) => {
    const { clinicName, doctorId, date, slot, reason, symptoms, medication, notes } = req.body;
    const patientId = req.user?._id;

    // Validate and extract startTime and endTime from the slot (e.g., "14:13 - 14:26")
    console.log("Received slot:", slot);
    if (!slot) {
        return res.status(400).json({ message: "Slot is missing or invalid" });
    }

    const [startTime, endTime] = slot.split(" - ");
    if (!doctorId || !clinicName || !date || !startTime || !endTime || !reason || !patientId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const uploadedFiles = [];
    if (req.files) {
        // If files are uploaded, process them and upload to Cloudinary (or other storage)
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage?.url) {
                uploadedFiles.push(uploadedImage.url); // Push the file URL to the array
            }
        }
    }

    try {
        // Check if the slot is already booked
        const doctorSchedule = await DoctorSchedule.findOne({
            doctorId,
            "clinics.name": clinicName,
            "clinics.bookedSlots": { $elemMatch: { date, time: { $in: [startTime, endTime] } } }
        });

        if (doctorSchedule) {
            return res.status(400).json({ message: "Slot already booked" });
        }

        // Update the doctor's schedule to mark the slot as booked
        await DoctorSchedule.updateOne(
            { doctorId, "clinics.name": clinicName },
            { $push: { "clinics.$.bookedSlots": { date, time: startTime } } }
        );

        // Create a new appointment
        const appointment = new Appointment({
            doctorId,
            patientId,
            appointmentDate: date,
            startTime,
            endTime,
            reason,
            symptoms: symptoms || [],
            medication: medication || [],
            notes,
            documentPath: uploadedFiles, // Attach uploaded files
            status: "scheduled",
        });

        // Save the appointment in the database
        await appointment.save();

        return res.status(201).json(
            new ApiResponse(201, { appointment }, "Your appointment has been booked successfully!")
        );
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



const updateAppointmentData = asyncHandler(async (req, res) => {
    let { status, comments, documentPath,  medications, prescriptions, diagnoses, appointmentId } = req.body;

    const AppointmentPics = [];
    if (req.files) {
        // If files are uploaded, process them
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage?.url) {
                AppointmentPics.push(uploadedImage.url); // Push image URL to array
            }
        }
    }

    // Validate that appointmentId is provided
    if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
    }

    try {
        // Find the appointment by appointmentId and update the fields
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                $set: {
                    ...(status && { status }),
                    ...(comments && { comments }),
                    ...(AppointmentPics && { documentPath: AppointmentPics }),  // Store the array of file paths
                    ...(medications && { medication: medications }),
                    ...(prescriptions && { prescription: prescriptions }),
                    ...(diagnoses && { diagnosis: diagnoses })
                }
            },
            { new: true } // Return the updated document
        );

        // Check if the appointment was found and updated
        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Respond with the updated appointment data
        return res.status(200).json(
            new ApiResponse(200, { appointment: updatedAppointment }, "Appointment updated successfully")
        );
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



const getPatienAppointmentData = asyncHandler(async (req, res) => {
    console.log("its working")
    const userId = req.user?._id
    console.log("Yhi is is user id = " , userId)

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }


    // const PatientReportData = await report.findOne({ userId });
    const PatientAppointmentData = await Appointment.find({ patientId: userId });


    if(PatientAppointmentData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                PatientAppointmentData : PatientAppointmentData,
            },
            "Patient Appointment Data sended Successfully!!!"
            )
        )
    }
})



    // router.get('/:appointmentId', auth, async (req, res) =>


export { 
    appointmentBooking,
    updateAppointmentData,
    getPatienAppointmentData,
};
