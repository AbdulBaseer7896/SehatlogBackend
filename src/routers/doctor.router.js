import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { insertDoctorDetails, setDoctorSchedule } from "../controllers/Doctor.Controller/doctor.controller.js";
import { isDoctorAuth } from "../middlewares/isDoctorAuth.model.js";


const router = Router();

// router.route("/login").post(loginUser)


// secured routes
router.route("/insert-doctor-Details").patch(verifyJWT , isDoctorAuth ,  insertDoctorDetails)
router.route("/set-doctor-schedule").patch(verifyJWT , isDoctorAuth ,  setDoctorSchedule)



export default router