import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";





const PatientSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cnicNumber: {
        type: Number,
        unique: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    homeAddress: {
        type: String,
    },
    dataOfBirth: {
        type: Date,
    },
    country: {
        type: String,
    },
    nationality: {
        type: String,
    },
    city: {
        type: String,
    },
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    knownAllergies: {
        type: [String], // Updated to array of strings
    },
    chronicDiseases: {
        type: [String], // Updated to array of strings
    },
    currentMedication: {
        type: [String], // Updated to array of strings
    },
    emergencyContactNamePrimary: {
        type: String,
    },
    emergencyContactRelationShipPrimary: {
        type: String,
        enum: ["father", "mother", "brother", "sister", "friend", "other"],
    },
    emergencyContactNumberPrimary: {
        type: Number,
    },
    emergencyContactNameSecondary: {
        type: String,
    },
    emergencyContactRelationShipSecondary: {
        type: String,
        enum: ["father", "mother", "brother", "sister", "friend", "other"],
    },
    emergencyContactNumberSecondary: {
        type: String,
    },
    MyDoctorList: {
        type: [String], // Updated to array of strings
        default: [] 
    },
}, { timestamps: true });



export const PatientInformation = mongoose.model('Patient', PatientSchema);