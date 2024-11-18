import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPatientProfileData, insertPatentDetails } from "../controllers/Patient.Controller/patient.controller.js";
import {isPatientAuth} from "../middlewares/isPatientAuth.middleware.js"
import { getPatientVaccinationData, insertVaccinationData } from "../controllers/Patient.Controller/vaccination.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { addHospitalRecord, getPatientHospitalData } from "../controllers/Patient.Controller/hospitalRecord.controller.js";
import { addPrescriptionRecord } from "../controllers/Patient.Controller/prescription.controller.js";
import { addReportRecord, getPatientReportData } from "../controllers/Patient.Controller/report.controller.js"

const router = Router();

// router.route("/login").post(loginUser)



// secured routes



router.route("/get-patient-profile-Details").get(verifyJWT , getPatientProfileData)
router.route("/get-patient-report-Details").get(verifyJWT , getPatientReportData)
router.route("/get-patient-vaccination-Details").get(verifyJWT , getPatientVaccinationData)
router.route("/get-patient-hospital-Details").get(verifyJWT , getPatientHospitalData)


router.route("/insert-patient-Details").patch(verifyJWT, isPatientAuth ,  insertPatentDetails)

router.route("/insert-Vaccines-Details").post(verifyJWT, isPatientAuth ,
    upload.array("vaccinePic"),
    insertVaccinationData
)

router.route("/add-hospital-Record").post(verifyJWT, isPatientAuth ,
    upload.array("hospitalDocumentsPic"),
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
    upload.array("reportPic"),
    addReportRecord
)
// router.route("/insert-Vaccines-Details").post(verifyJWT, isPatientAuth ,  insertVaccinationData)



export default router