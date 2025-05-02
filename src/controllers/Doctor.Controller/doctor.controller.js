import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { DoctorInformation, DoctorSchedule } from "../../models/doctor.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import mongoose from 'mongoose';
import { sharedRecord } from "../../models/shareRecords.model.js";
import { report } from "../../models/report.model.js";
import { prescription } from "../../models/prescription.model.js";
import { vaccination } from "../../models/Vaccines.model.js";

const insertDoctorDetails = asyncHandler(async (req, res) => {
    const {
        cnicNumber,
        phoneNumber,
        gender,
        homeAddress,
        workingAddress,
        DOB,
        country,
        nationality,
        city,
        experience,
        affiliatedHospitals,
        languagesSpoken,
        medicalLicense,
        ratings,
        biography,
        status,
        qualification,      // Added qualification
        specialization,     // Added specialization
        clinics,            // Added clinics
        memberships         // Added memberships
    } = req.body;

    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Not authenticated request token");
    }

    // Check if the doctor with the same CNIC or phone number already exists
    const existingDoctor = await DoctorInformation.findOne({
        $or: [{ cnicNumber }, { phoneNumber }]
    });

    if (existingDoctor) {
        throw new ApiError(409, "Doctor with this CNIC or phone number already exists");
    }

    // Create new doctor details
    const doctor = new DoctorInformation({
        userId,
        cnicNumber,
        phoneNumber,
        gender,
        homeAddress,
        workingAddress,
        DOB,
        country,
        nationality,
        city,
        experience,
        affiliatedHospitals,
        languagesSpoken,
        medicalLicense,
        ratings,
        biography,
        status,
        qualification,         // Saving qualification
        specialization,        // Saving specialization
        clinics,               // Saving clinics
        memberships            // Saving memberships
    });

    // Save the doctor to the database
    await doctor.save();

    // Send response
    return res.status(201).json(
        new ApiResponse(201, doctor, "Doctor information added successfully")
    );
});







const getDoctorProfileData = async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "User Id Is required")
    }


    const DoctorProfileData = await DoctorInformation.findOne({ userId });

    if (DoctorProfileData) {
        return res
            .status(201)
            .json(
                new ApiResponse(201, {
                    DoctorProfileData: DoctorProfileData,
                },
                    "Doctor Profile Data sended Successfully!!!"
                )
            )
    }
}


const setDoctorSchedule = asyncHandler(async (req, res) => {
    const { clinics } = req.body;
    const doctorId = req.user?._id;

    console.log("Received doctorId:", doctorId);
    console.log("Received clinics data:", JSON.stringify(clinics, null, 2));
    console.log("Received clinics data:", JSON.stringify(clinics[0].slotTime, null, 2));

    // Validate the presence of clinics
    if (!clinics || !Array.isArray(clinics) || clinics.length === 0) {
        throw new ApiError(401, "Clinics data is required and should be an array");
    }

    // Validate each clinic's structure
    clinics.forEach((clinic, index) => {
        if (!clinic?.name || !clinic?.clinicAddress || !clinic?.slotTime || !Array.isArray(clinic?.days) ||
            !clinic?.timing?.start || !clinic?.timing?.end) {
            console.error(`Invalid clinic at index ${index}:`, clinic);
            throw new ApiError(400, `Clinic at index ${index} is missing required fields`);
        }

        // Validate each break's structure
        clinic.breaks?.forEach((breakTime, breakIndex) => {
            if (!breakTime?.start || !breakTime?.end) {
                console.error(`Invalid break at index ${breakIndex} in clinic ${index}:`, breakTime);
                throw new ApiError(400, `Break at index ${breakIndex} in clinic ${index} is missing start or end time`);
            }
        });
    });

    // Upsert the schedule
    const schedule = await DoctorSchedule.findOneAndUpdate(
        { doctorId },
        { clinics },
        { upsert: true, new: true }
    );

    return res.status(200).json(new ApiResponse(200, schedule, "Doctor schedule set successfully"));
});


const getSharedRecordsByDoctor = async (req, res) => {
    try {
        const doctorId = req.user?._id;

        // Validate doctor ID
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid doctor ID format'
            });
        }

        // Get doctor's professional ID
        const doctorInfo = await DoctorInformation.findOne({ userId: doctorId })
            .select('_id')
            .lean();

        if (!doctorInfo) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        // Get shared records with populated patient details
        const sharedRecords = await sharedRecord.find({
            doctors: doctorInfo._id
        })
        .populate({
            path: 'patientId',
            select: 'fullName email',
            model: 'User'
        })
        .lean();

        if (!sharedRecords.length) {
            return res.status(404).json({
                success: false,
                message: 'No shared records found for this doctor'
            });
        }

        // Utility function to safely extract IDs
        const extractValidIds = (dataArrays, field = '_id') => {
            const ids = [];
            for (const record of dataArrays) {
                for (const item of record[field]) {
                    if (mongoose.Types.ObjectId.isValid(item._id)) {
                        ids.push(new mongoose.Types.ObjectId(item._id));
                    }
                }
            }
            return [...new Set(ids)]; // Remove duplicates
        };

        // Get all document IDs from shared records
        const reportIds = extractValidIds(sharedRecords, 'reportsData');
        const prescriptionIds = extractValidIds(sharedRecords, 'prescriptionsData');
        const upcomingVaccIds = extractValidIds(sharedRecords, 'upcomingVaccinationsData');
        const completedVaccIds = extractValidIds(sharedRecords, 'completedVaccinationsData');

        // Parallel document fetching
        const [
            reports,
            prescriptions,
            upcomingVaccinations,
            completedVaccinations
        ] = await Promise.all([
            report.find({ _id: { $in: reportIds } }).lean(),
            prescription.find({ _id: { $in: prescriptionIds } }).lean(),
            vaccination.find({ _id: { $in: upcomingVaccIds } }).lean(),
            vaccination.find({ _id: { $in: completedVaccIds } }).lean()
        ]);

        // Create document maps for efficient lookup
        const createDocumentMap = (documents) => 
            new Map(documents.map(doc => [doc._id.toString(), doc]));

        const reportMap = createDocumentMap(reports);
        const prescriptionMap = createDocumentMap(prescriptions);
        const upcomingVaccMap = createDocumentMap(upcomingVaccinations);
        const completedVaccMap = createDocumentMap(completedVaccinations);

        // Build final response structure
        const formattedResults = sharedRecords.map(record => ({
            patient: {
                _id: record.patientId._id,
                fullName: record.patientId.fullName,
                email: record.patientId.email
            },
            sharedDocuments: {
                reports: record.reportsData
                    .map(rd => reportMap.get(rd._id.toString()))
                    .filter(Boolean),
                prescriptions: record.prescriptionsData
                    .map(pd => prescriptionMap.get(pd._id.toString()))
                    .filter(Boolean),
                upcomingVaccinations: record.upcomingVaccinationsData
                    .map(uv => upcomingVaccMap.get(uv._id.toString()))
                    .filter(Boolean),
                completedVaccinations: record.completedVaccinationsData
                    .map(cv => completedVaccMap.get(cv._id.toString()))
                    .filter(Boolean)
            }
        }));
        console.log("this is import = " , formattedResults)

        res.status(200).json({
            success: true,
            data: formattedResults
        });

    } catch (error) {
        console.error('Error in getSharedRecordsByDoctor:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


// const getSharedRecordsByDoctor = async (req, res) => {
//     try {
//         const doctorId = req.user?._id;

//         // Get doctor's information
//         const DoctorUserId = await DoctorInformation.findOne(
//             { userId: doctorId },
//             { _id: 1 }
//         );

//         // Get shared records with populated patient details
//         const sharedRecords = await sharedRecord.find({
//             doctors: DoctorUserId._id
//         }).populate({
//             path: 'patientId',
//             select: 'fullName email', // Get both name and email
//             model: 'User'
//         });

//         console.log("This is the shared record = , ", sharedRecords);

//         if (!sharedRecords.length) {
//             return res.status(404).json({ message: 'No shared records found' });
//         }

//         // Modified extractIds function with validation
//         const extractIds = (arr) =>
//             arr.flatMap(record =>
//                 record.map(doc => {
//                     if (mongoose.Types.ObjectId.isValid(doc._id)) {
//                         return new mongoose.Types.ObjectId(doc._id);
//                     }
//                     throw new Error(`Invalid ID format: ${doc._id}`);
//                 })
//             );

//         // Rest of the document fetching logic remains the same
//         // ... [keep the existing Promise.all and filtering logic]

//         // Format the response with patient details
//         const result = sharedRecords.map(record => ({
//             patient: {
//                 _id: record.patientId._id,
//                 fullName: record.patientId.fullName,
//                 email: record.patientId.email
//             },
//             reports: reports.filter(r => 
//                 record.reportsData.some(rd => rd._id === r._id.toString())
//             ),
//             prescriptions: prescriptions.filter(p => 
//                 record.prescriptionsData.some(pd => pd._id === p._id.toString())
//             ),
//             upcomingVaccinations: upcomingVaccinations.filter(uv => 
//                 record.upcomingVaccinationsData.some(u => u._id === uv._id.toString())
//             ),
//             completedVaccinations: completedVaccinations.filter(cv => 
//                 record.completedVaccinationsData.some(c => c._id === cv._id.toString())
//             )
//         }));

//         res.status(200).json({
//             success: true,
//             data: result
//         });

//     } catch (error) {
//         console.error('Error fetching shared records:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// const getSharedRecordsByDoctor = async (req, res) => {
//     try {
//         //   const { doctorId } = req.params;
//         const doctorId = req.user?._id;

//         const DoctorUserId = await DoctorInformation.findOne(
//             { userId: doctorId },
//             { _id: 1 }
//         );

//         // const sharedRecords = await sharedRecord.find({ doctorId : DoctorUserId });
//         const sharedRecords = await sharedRecord.find({
//             doctors: DoctorUserId._id
//         }).populate('patientId', 'firstName lastName email');

//         console.log("This is the shared record = , " , sharedRecords)
//         if (!sharedRecords.length) {
//             return res.status(404).json({ message: 'No shared records found' });
//         }

//         // // Extract all document IDs from shared records
//         const extractIds = (arr) =>
//             arr.flatMap(record =>
//                 record.map(doc => new mongoose.Types.ObjectId(doc._id))
//             );

//         // // Get all IDs from different categories
//         const reportIds = extractIds(sharedRecords.map(r => r.reportsData));
//         const prescriptionIds = extractIds(sharedRecords.map(r => r.prescriptionsData));
//         const upcomingVaccIds = extractIds(sharedRecords.map(r => r.upcomingVaccinationsData));
//         const completedVaccIds = extractIds(sharedRecords.map(r => r.completedVaccinationsData));

//         // Fetch actual documents in parallel
//         const [
//             reports,
//             prescriptions,
//             upcomingVaccinations,
//             completedVaccinations
//         ] = await Promise.all([
//             report.find({ _id: { $in: reportIds } }),
//             prescription.find({ _id: { $in: prescriptionIds } }),
//             vaccination.find({ _id: { $in: upcomingVaccIds } }),
//             vaccination.find({ _id: { $in: completedVaccIds } })
//         ]);

//         // Group results by patient
//         const result = sharedRecords.map(record => ({
//             patientId: record.patientId,
//             reports: reports.filter(r =>
//                 record.reportsData.some(rd => rd._id === r._id.toString())
//             ),
//             prescriptions: prescriptions.filter(p =>
//                 record.prescriptionsData.some(pd => pd._id === p._id.toString())
//             ),
//             upcomingVaccinations: upcomingVaccinations.filter(uv =>
//                 record.upcomingVaccinationsData.some(u => u._id === uv._id.toString())
//             ),
//             completedVaccinations: completedVaccinations.filter(cv =>
//                 record.completedVaccinationsData.some(c => c._id === cv._id.toString())
//             )
//         }));

//         res.status(200).json({
//             success: true,
//             data: result
//         });

//     } catch (error) {
//         console.error('Error fetching shared records:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

export {
    insertDoctorDetails,
    setDoctorSchedule,
    getDoctorProfileData,
    getSharedRecordsByDoctor
};