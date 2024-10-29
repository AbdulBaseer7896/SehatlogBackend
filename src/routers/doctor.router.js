import { Router } from "express";
import { getCurrentUser, refreshAccessToken,  updateAccountDetails} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { insertDoctorDetails } from "../controllers/doctor.controller.js";
import { isDoctorAuth } from "../middlewares/isDoctorAuth.model.js";


const router = Router();

// router.route("/login").post(loginUser)


// secured routes
router.route("/insert-doctor-Details").patch(verifyJWT , isDoctorAuth ,  insertDoctorDetails)



export default router