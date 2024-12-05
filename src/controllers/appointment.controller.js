


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DoctorSchedule } from "../models/doctor.model.js";

const appointmentBooking = asyncHandler(async (req, res) => {
    const { clinicName, doctorId, date, slot, reason, symptoms, medication, notes } = req.body;
    const patientId = req.user?._id;

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

        return res.status(201).json(
            new ApiResponse(201, { appointment: appointment }, "Your appointment has been booked successfully!")
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


export { 
    appointmentBooking,
    updateAppointmentData
};
