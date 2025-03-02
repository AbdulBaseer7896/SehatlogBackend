import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addFavoritesDoctor, getDoctorData, getDoctorScheduleData, getFavoritesDoctor, getPatientProfileData, insertPatentDetails, removeFavoritesDoctor } from "../controllers/Patient.Controller/patient.controller.js";
import {isPatientAuth} from "../middlewares/isPatientAuth.middleware.js"
import { getPatientVaccinationData, insertVaccinationData } from "../controllers/Patient.Controller/vaccination.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { addHospitalRecord, getPatientHospitalData } from "../controllers/Patient.Controller/hospitalRecord.controller.js";
import { addPrescriptionRecord, getPrescriptionRecord } from "../controllers/Patient.Controller/prescription.controller.js";
import { addReportRecord, getPatientReportData } from "../controllers/Patient.Controller/report.controller.js"
import { addFamilyMember, getFamilyMemberData, switchToFamilyMember, switchToPersonal } from "../controllers/Patient.Controller/myFamily.controller.js";

const router = Router();

// router.route("/login").post(loginUser)



// secured routes



router.route("/get-patient-profile-Details").get(verifyJWT , getPatientProfileData)
router.route("/get-patient-report-Details").get(verifyJWT , getPatientReportData)
router.route("/get-patient-vaccination-Details").get(verifyJWT , getPatientVaccinationData)
router.route("/get-patient-hospital-Details").get(verifyJWT , getPatientHospitalData)
router.route("/get-doctor-data").get(verifyJWT , getDoctorData)
router.route("/get-doctor-schedule-data/:doctorId").get(verifyJWT, getDoctorScheduleData);
router.route("/getFavoritesDoctor").get(verifyJWT , getFavoritesDoctor)
router.route("/getPrescriptionRecord").get(verifyJWT , getPrescriptionRecord)
router.route("/getFamilyMemberData").get(verifyJWT , getFamilyMemberData)



router.route("/insert-patient-Details").patch(verifyJWT, isPatientAuth ,  insertPatentDetails)
router.route("/favorites/add").patch(verifyJWT, isPatientAuth ,  addFavoritesDoctor)
router.route("/favorites/remove").patch(verifyJWT, isPatientAuth ,  removeFavoritesDoctor)


router.route("/switch-to-personal").post(verifyJWT, switchToPersonal);
router.route("/switch-profile").post(verifyJWT, switchToFamilyMember);
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
router.route("/add-family-member").post(verifyJWT, isPatientAuth ,addFamilyMember)



// router.route("/insert-Vaccines-Details").post(verifyJWT, isPatientAuth ,  insertVaccinationData)



export default router