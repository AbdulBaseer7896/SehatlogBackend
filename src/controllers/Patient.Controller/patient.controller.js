import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import {PatientInformation} from "../../models/patient.model.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { DoctorInformation, DoctorSchedule } from "../../models/doctor.model.js";




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







// const getDoctorData = async (req, res) => {
//     const userId = req.user?._id

//     if(!userId){
//         throw new ApiError(400, "User Id Is required")
//     }

//     const DoctorInformationData = await DoctorInformation.find().select("-cnicNumber -phoneNumber -homeAddress -DOB -city -nationality -createdAt -updatedAt");

//     console.log("This si ok to see  " ,DoctorInformationData)

//     if(DoctorInformationData){
//         return res
//         .status(201)
//         .json(
//             new ApiResponse(201, {
//                 DoctorInformationData : DoctorInformationData,
//             },
//             "Patient Profile Data sended Successfully!!!"
//             )
//         )
//     }
// }


const getDoctorData = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    // Fetch all doctor data and populate the doctor name from the User table
    const DoctorInformationData = await DoctorInformation.find()
        .select("-cnicNumber -phoneNumber -homeAddress -DOB -city -nationality -createdAt -updatedAt") // Exclude unnecessary fields
        .populate({
            path: 'userId', // the reference to the 'User' model
            select: 'fullName' // only include the full name of the doctor
        });

    console.log("This si ok to see ", DoctorInformationData);

    if (DoctorInformationData) {
        return res
            .status(201)
            .json(
                new ApiResponse(201, {
                    DoctorInformationData: DoctorInformationData,
                },
                    "Patient Profile Data sent Successfully!!!"
                )
            );
    }
};


const getDoctorScheduleData = async (req, res) => {
    const userId = req.user?._id; // Extract user ID from the JWT payload
    const doctorId = req.params.doctorId; // Extract doctorId from the route parameters

    console.log("this is the data = 1 , " , doctorId)

    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    if (!doctorId) {
        throw new ApiError(400, "Doctor Id is required");
    }

    try {
        const DoctorScheduleData = await DoctorSchedule.findOne({ doctorId });
        console.log("Thisis the data sdgfasd  = " , DoctorScheduleData)

        if (DoctorScheduleData) {
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        {
                            DoctorScheduleData: DoctorScheduleData,
                        },
                        "Doctor Schedule  Data sent successfully!!!"
                    )
                );
        } else {
            throw new ApiError(404, "Doctor Schedule data not found");
        }
    } catch (error) {
        console.error("Error fetching doctor schedule data:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
};







export {
    insertPatentDetails,
    getPatientProfileData,
    getDoctorData,
    getDoctorScheduleData
}