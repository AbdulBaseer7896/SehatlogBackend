import mongoose, { Schema } from "mongoose";

const DoctorSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cnicNumber: {
        type: Number,
        required: [true, "Please enter a CNIC number"],
        unique: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, "Please enter a phone number"],
        unique: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    homeAddress: {
        type: String
    },
    workingAddress: {
        type: String
    },
    DOB: {
        type: Date,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    affiliatedHospitals: [{
        type: String
    }],
    // consultationFee: {
    //     type: Number,
    //     required: true
    // },
    languagesSpoken: [{
        type: String
    }],
    medicalLicense: [{
        licenseNumber: {
            type: String,
            required: true
        },
        stateIssued: {
            type: String,
            required: true
        },
        expirationDate: {
            type: Date,
            required: true
        }
    }],
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    biography: {
        type: String
    },
    status: {
        type: String,
    },
    qualification: [{
        type: String // Array of qualifications (e.g., "MBBS", "MD")
    }],
    specialization: [{
        type: String // Array of specializations (e.g., "Dermatology", "Cardiology")
    }],
    clinics: [{
        name: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        days: [{
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }],
        timing: {
            start: {
                type: String
            },
            end: {
                type: String
            }
        }
    }],
    memberships: [{
        type: String // Array of memberships (e.g., "Medical Association")
    }],
    avatar: {
        type: String
    },
    coverImage: {
        type: String
    }
}, { timestamps: true });



const DoctorScheduleSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    clinics: [
        {
            name: {
                type: String,
                required: true
            },
            clinicAddress: { // Updated from location to clinicAddress
                type: String,
                required: true
            },
            days: {
                type: [String], // e.g., ["Monday", "Tuesday"]
                enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                required: true
            },
            timing: {
                start: {
                    type: String,
                    required: true
                },
                end: {
                    type: String,
                    required: true
                }
            },
            breaks: [
                {
                    start: {
                        type: String,
                        required: true
                    },
                    end: {
                        type: String,
                        required: true
                    }
                }
            ],
            slotTime:{
                type: Number,
            },
            bookedSlots: [
                {
                    date: {
                        type: Date,
                        required: true
                    },
                    time: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
    ],
});


export const DoctorSchedule = mongoose.model("DoctorSchedule", DoctorScheduleSchema);


export const DoctorInformation  = mongoose.model("DoctorInformation", DoctorSchema);
