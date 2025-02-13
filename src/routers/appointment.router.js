import { Router } from "express";
import { getCurrentUser, refreshAccessToken,  updateAccountDetails} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isPatientAuth } from "../middlewares/isPatientAuth.middleware.js";
import {appointmentBooking, updateAppointmentData} from "../controllers/appointment.controller.js"
import { isDoctorAuth } from "../middlewares/isDoctorAuth.model.js";


const router = Router();

// router.route("/login").post(loginUser)


// secured routes
router.route("/appointment-booking").post(verifyJWT, isPatientAuth ,
    upload.array("documentPath"),
    appointmentBooking
)



router.route("/update-patient-appointment-by-doctor/:appointmentId").patch(verifyJWT, isDoctorAuth ,
    upload.array("documentPath"),
    updateAppointmentData
)

export default router