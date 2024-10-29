import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";





const PatientSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cnicNumber : {
        type:Number,
        required: [true, "Please enter a CNIC number"],
        unique: true,
        lowercase: true,
        trim:true,
    },
    fullName: {
        type:String,
        required: [true, "Please enter a fullname"],
        trim:true,
        index:true
    },
    phoneNumber: {
        type:String,
        required: [true, "Please enter a phone number"],
        unique: true,
        trim:true,
    },
    gender: {
        type:String,
        enum: ["male", "female"],
        required:true,
    },
    homeAddress:{
        type:String,
    },
    workingAddress:{
        type:String
    },
    dataOfBirth:{
        type:Date,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    Nationality:{
        type:String,
        required:true,
    },
    City:{
        type:String,
        required:true,
    },
    BloodGroup:{
        type:String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required:true,
    },
    KnownAllergies:{
        type:String,
    },
    chronicDiseases:{
        type:String,
    },
    currentMedication:{
        type:String,
    },
    EmergencyContactName:{
        type:String,
        required: true,
    },
    EmergencyContactRelationShip:{
        type:String,
        enum: ["father", "mother", "brother", "sister", "friend", "other"],
        required:true,
    },
    EmergencyContactNumber:{
        type:String,
        required: true,
    },
    AnyDisability:{
        type:Boolean,
        default: false,
    },
    avatar: {
        type:String,
    },
    coverImage: {
        type:String,
    },

},{timestamps:true})




export const PatientInformation = mongoose.model('Patient', PatientSchema);