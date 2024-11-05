import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { report } from "../../models/report.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"



const addReportRecord = asyncHandler(async (req, res) => {

    const { doctorId, reportName, reportType,
        reportDate, findings, testName,resultValue,units,
        referenceRange ,description ,notes,  status
    } = req.body

    console.log("its test 1")
    const patientId = req.user._id

    if(!patientId){
        throw new ApiError(409, "unauthorized request")
    }

    console.log("its test 2")
    if (!reportName) {
        throw new ApiError(400, "Report Name is required")
    }
    const reportPic = req.files?.["reportPic"]?.[0]?.path || "" ;
    console.log("This is the reportPic = " , reportPic)
    console.log("its test 22")
    const documentImage = await uploadOnCloudinary(reportPic)

    console.log("its test 222")


    const reportData = await report.create({
        patientId : patientId,
        doctorId,
        reportName,
        reportType,
        reportDate,
        findings,
        testName,
        resultValue,
        units,
        referenceRange,
        description,
        notes,
        status,
        reportPic: documentImage?.url || "",
    })

    console.log("its test 3")




    const addReport = await report.findById(reportData._id)
    if (!addReport) {
        throw new ApiError(500, "Something went wrong while Report inserting!!")
    }

    console.log("its test 4")


    return res.status(201).json(
        new ApiResponse(200, addReport, "Report added successfully!!!")
    )

})

export {
    addReportRecord,
}
