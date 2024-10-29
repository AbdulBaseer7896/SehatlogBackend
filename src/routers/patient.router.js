import { Router } from "express";
import { getCurrentUser, refreshAccessToken,  updateAccountDetails} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { insertPatentDetails } from "../controllers/patient.controller.js";
import {isPatientAuth} from "../middlewares/isPatientAuth.middleware.js"


const router = Router();

// router.route("/login").post(loginUser)


// secured routes
router.route("/insert-patient-Details").patch(verifyJWT, isPatientAuth ,  insertPatentDetails)



export default router