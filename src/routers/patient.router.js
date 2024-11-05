import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { insertPatentDetails } from "../controllers/Patient.Controller/patient.controller.js";
import {isPatientAuth} from "../middlewares/isPatientAuth.middleware.js"
import { insertVaccinationData } from "../controllers/Patient.Controller/vaccination.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { addHospitalRecord } from "../controllers/Patient.Controller/hospitalRecord.controller.js";
import { addPrescriptionRecord } from "../controllers/Patient.Controller/prescription.controller.js";
import { addReportRecord } from "../controllers/Patient.Controller/report.controller.js"

const router = Router();

// router.route("/login").post(loginUser)



// secured routes


router.route("/insert-patient-Details").patch(verifyJWT, isPatientAuth ,  insertPatentDetails)

router.route("/insert-Vaccines-Details").post(verifyJWT, isPatientAuth ,
    upload.fields([
        {
            name: "vaccinationPic",
            maxCount: 1
        }
    ]),
    insertVaccinationData
)

router.route("/add-hospital-Record").post(verifyJWT, isPatientAuth ,
    upload.fields([
        {
            name: "otherDocumentsImages",
            maxCount: 1
        }
    ]),
    addHospitalRecord
)


router.route("/add-prescription-Record").post(verifyJWT, isPatientAuth ,
    upload.fields([
        {
            name: "prescriptionImages",
            maxCount: 1
        }
    ]),
    addPrescriptionRecord
)


router.route("/add-Report-Record").post(verifyJWT, isPatientAuth ,
    upload.fields([
        {
            name: "reportPic",
            maxCount: 1
        }
    ]),
    addReportRecord
)
// router.route("/insert-Vaccines-Details").post(verifyJWT, isPatientAuth ,  insertVaccinationData)



export default router