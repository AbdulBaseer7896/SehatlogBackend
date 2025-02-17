import { Router } from "express";
import { getCurrentUser, refreshAccessToken,  updateAccountDetails} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isPatientAuth } from "../middlewares/isPatientAuth.middleware.js";
import {appointmentBooking, getAppointmentId, getPatienAppointmentData, updateAppointmentData} from "../controllers/appointment.controller.js"
import { isDoctorAuth } from "../middlewares/isDoctorAuth.model.js";
import { updataAppointmentStatus } from "../controllers/Doctor.Controller/appointments.controller.js";


const router = Router();

// router.route("/login").post(loginUser)


router.route("/getPatientAppointmentData").get(verifyJWT , getPatienAppointmentData)
router.route("/:appointmentId").get(verifyJWT , getAppointmentId)

// secured routes
router.route("/appointment-booking").post(verifyJWT, isPatientAuth ,
    upload.array("documentPath"),
    appointmentBooking
)



router.route("/update-patient-appointment-by-doctor/:appointmentId").patch(verifyJWT, isDoctorAuth ,
    upload.array("documentPath"),
    updateAppointmentData
)
router.route("/:id/status").put(verifyJWT, isDoctorAuth ,updataAppointmentStatus)

export default router