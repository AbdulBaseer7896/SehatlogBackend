import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import {PatientInformation} from "../../models/patient.model.js"
import { ApiResponse } from "../../utils/ApiResponse.js"




const insertPatentDetails = asyncHandler(async (req, res) => {

    console.log("this is the insertPatent detailes")
    const {                     fullName,
                    phoneNumber,
                    cnicNumber,
                    gender,
                    homeAddress,
                    workingAddress,
                    dataOfBirth,
                    country,
                    nationality,
                    city,
                    bloodGroup,
                    knownAllergies, // Ensure it's passed as an array
                    chronicDiseases, // Ensure it's passed as an array
                    currentMedication, // Ensure it's passed as an array
                    emergencyContactNamePrimary,
                    emergencyContactRelationShipPrimary,
                    emergencyContactNumberPrimary,
                    emergencyContactNameSecondary,
                    emergencyContactRelationShipSecondary,
                    emergencyContactNumberSecondary
    } = req.body



    console.log(req.body)

    // const existedPatient = await  PatientInformation.findOne({
    //     $or : [{phoneNumber} , {cnicNumber}]
    // })

    
    // if(existedPatient) {
    //     throw new ApiError(409 , "Patient Phone Number or CNIC already exists")
    // }

    const userId = req.user?._id


    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }



    const isPatientAlreadyExisted = await PatientInformation.findOne({ userId });

    if(!isPatientAlreadyExisted){
        const patients = await PatientInformation.create({
            userId,
            phoneNumber,
            cnicNumber,
            gender,
            homeAddress,
            workingAddress,
            dataOfBirth,
            country,
            nationality,
            city,
            bloodGroup,
            knownAllergies, // Ensure it's passed as an array
            chronicDiseases, // Ensure it's passed as an array
            currentMedication, // Ensure it's passed as an array
            emergencyContactNamePrimary,
            emergencyContactRelationShipPrimary,
            emergencyContactNumberPrimary,
            emergencyContactNameSecondary,
            emergencyContactRelationShipSecondary,
            emergencyContactNumberSecondary
        })
        console.log("This is 2")
    
    
    
        const createdPatients = await PatientInformation.findById(patients._id)
        console.log("This is 3")
    
        if(!createdPatients) {
            console.log("This is 4")
            throw new ApiError(500 , "Something went wrong while registering the user!!")
        }
        console.log("This is 5")
    
    
        return res.status(201).json(
            new ApiResponse(200, createdPatients , "Account details Added successfully")
        )
    }


    if (isPatientAlreadyExisted) {
        const updatedPatient = await PatientInformation.findOneAndUpdate(
            { userId: req.user?._id }, // Correctly query by userId
            {
                $set: {
                    phoneNumber,
                    cnicNumber,
                    gender,
                    homeAddress,
                    workingAddress,
                    dataOfBirth,
                    country,
                    nationality,
                    city,
                    bloodGroup,
                    knownAllergies, // Ensure it's passed as an array
                    chronicDiseases, // Ensure it's passed as an array
                    currentMedication, // Ensure it's passed as an array
                    emergencyContactNamePrimary,
                    emergencyContactRelationShipPrimary,
                    emergencyContactNumberPrimary,
                    emergencyContactNameSecondary,
                    emergencyContactRelationShipSecondary,
                    emergencyContactNumberSecondary
                }
            },
            { new: true, select: "-password" } // Include 'select' option to exclude password
        );
    
        return res.status(200).json(
            new ApiResponse(200, updatedPatient, "Patient details updated successfully")
        );
    } else {
        // Handle case where patient does not exist (optional)
        return res.status(404).json(
            new ApiResponse(404, null, "Patient not found")
        );
    }
    })



const getPatientProfileData = async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Is required")
    }


    const PatientProfileData = await PatientInformation.findOne({ userId });

    if(PatientProfileData){
        return res
        .status(201)
        .json(
            new ApiResponse(201, {
                PatientProfileData : PatientProfileData,
            },
            "Patient Profile Data sended Successfully!!!"
            )
        )
    }
}




export {
    insertPatentDetails,
    getPatientProfileData
}