import { Router } from "express";
import { getCurrentUser, refreshAccessToken,  updateAccountDetails} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isPatientAuth } from "../middlewares/isPatientAuth.middleware.js";
import {appointmentBooking} from "../controllers/appointment.controller.js"


const router = Router();

// router.route("/login").post(loginUser)


// secured routes
// router.route("/appointment-booking").post(verifyJWT , isPatientAuth ,  appointmentBooking)



router.route("/appointment-booking").post(verifyJWT, isPatientAuth ,
    upload.array("documents"),
    appointmentBooking
)


export default router