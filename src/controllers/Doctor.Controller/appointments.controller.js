import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { DoctorInformation, DoctorSchedule } from "../../models/doctor.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Appointment } from "../../models/appointment.model.js";
import { PatientInformation } from "../../models/patient.model.js";


// const getPatientAppointmentData = async (req, res) => {
//     const userId = req.user?._id

//     console.log("this is the id = ", userId)

//     if (!userId) {
//         throw new ApiError(400, "User Id Is required")
//     }

//     console.log("this si 2324")

//     const AppointmentData = await Appointment.find({ doctorId: userId });
//     console.log("This is the Appointments data = " , AppointmentData)

//     console.log("this si the AppointmentData =  " + AppointmentData)

//     if (AppointmentData) {
//         return res
//             .status(201)
//             .json(
//                 new ApiResponse(201, {
//                     AppointmentData: AppointmentData,
//                 },
//                     "Patient Appointment Data sended Successfully!!!"
//                 )
//             )
//     }
// }




// const getPatientAppointmentData = async (req, res) => {
//     const userId = req.user?._id;

//     if (!userId) {
//         throw new ApiError(400, "User Id Is required");
//     }

//     // Fetch appointments and populate patient details
//     const AppointmentData = await Appointment.find({ doctorId: userId })
//         .populate({
//             path: "patientId",
//             model: "User",
//             select: "fullName" // Only get the patient's name
//         });
//         console.log("This is import to see = = " , AppointmentData)

//     // Format response to include patientName while keeping patientId
//     const formattedAppointments = AppointmentData.map(appointment => ({
//         ...appointment.toObject(),
//         patientName: appointment.patientId.fullName
//     }));getPatientProfileDataToViewInAppointment 
//     // console.log("This is the data = " , formattedAppointments)

//     return res.status(201).json(
//         new ApiResponse(201, {
//             AppointmentData: formattedAppointments,
//         }, "Doctor Appointments Data Sent Successfully!!!")
//     );
// };




const getPatientAppointmentData = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User Id Is required");
    }

    // Fetch appointments with patient details
    const AppointmentData = await Appointment.find({ doctorId: userId })
        .populate({
            path: "patientId",
            model: "User",
            select: "fullName" // Get only fullName
        });

    // Format to retain original patientId + add patientName
    const formattedAppointments = AppointmentData.map(appointment => {
        const appointmentObj = appointment.toObject();
        return {
            ...appointmentObj,
            patientId: appointmentObj.patientId._id, // Original ID
            patientName: appointmentObj.patientId.fullName // New field
        };
    });
    return res.status(201).json(
        new ApiResponse(201, {
            AppointmentData: formattedAppointments,
        }, "Doctor Appointments Data Sent Successfully!!!")
    );
};


const getPatientProfileDataToViewInAppointment = async (req, res) => {
    const { patientId } = req.params; // Extract patientId from request parameters

    if (!patientId) {
        throw new ApiError(400, "User Id Is required")
    }


    const PatientProfileData = await PatientInformation.findOne({ userId: patientId }).select("-cnicNumber -homeAddress -updateAt -emergencyContactRelationShipSecondary  -emergencyContactRelationShipPrimary -emergencyContactNumberSecondary  -emergencyContactNumberPrimary -emergencyContactNameSecondary -emergencyContactNamePrimary ");

    if (PatientProfileData) {
        return res
            .status(201)
            .json(
                new ApiResponse(201, {
                    PatientProfileData: PatientProfileData,
                },
                    "Patient Profile Data sended Successfully!!!"
                )
            )
    }
}



// router.put('/:id/status', auth, async (req, res) => {
const updataAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }



};

export {
    getPatientAppointmentData,
    getPatientProfileDataToViewInAppointment,
    updataAppointmentStatus,

};