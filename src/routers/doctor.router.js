import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getDoctorProfileData, insertDoctorDetails, setDoctorSchedule } from "../controllers/Doctor.Controller/doctor.controller.js";
import { isDoctorAuth } from "../middlewares/isDoctorAuth.model.js";
import { getPatientAppointmentData, getPatientProfileDataToViewInAppointment } from "../controllers/Doctor.Controller/appointments.controller.js";
import { updateAppointmentData } from "../controllers/appointment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

// router.route("/login").post(loginUser)


// secured routes
router.route("/get-doctor-profile-Details").get(verifyJWT , isDoctorAuth ,  getDoctorProfileData)
router.route("/get-patient-appointment-data").get(verifyJWT , isDoctorAuth ,  getPatientAppointmentData)
router.route("/get-patient-profile-Details-to-view-in-appointment/:patientId").get(verifyJWT , isDoctorAuth ,  getPatientProfileDataToViewInAppointment)



router.route("/insert-doctor-Details").patch(verifyJWT , isDoctorAuth ,  insertDoctorDetails)
router.route("/set-doctor-schedule").patch(verifyJWT , isDoctorAuth ,  setDoctorSchedule)
// router.route("/updataAppointmentStatus").patch(verifyJWT , isDoctorAuth ,  updataAppointmentStatus)


router.route("/update-patient-appointment-by-doctor/:appointmentId").patch(verifyJWT, isDoctorAuth ,
    upload.array("uploadedFiles"),
    updateAppointmentData
)
// router.route("/update-patient-appointment-by-doctor/:appointmentId").patch(verifyJWT , isDoctorAuth ,  setDoctorSchedule)



export default router 