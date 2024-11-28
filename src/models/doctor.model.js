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
    startTime: {
        type: String, // e.g., "09:00"
        required: true,
        validate: {
            validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v), // Regex to enforce "HH:mm" format
            message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
        }
    },
    endTime: {
        type: String, // e.g., "17:00"
        required: true,
        validate: {
            validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
        }
    },
    slotDuration: {
        type: Number, // e.g., 15 (for 15 minutes per slot)
        required: true
    },
    breakTimes: [{
        start: {
            type: String, // e.g., "12:00"
            validate: {
                validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
            }
        },
        end: {
            type: String, // e.g., "13:00"
            validate: {
                validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
            }
        }
    }],
    offDays: [{
        type: [String],
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    }],
    maxAppointmentsPerDay: {
        type: Number,
        default: 20
    }
});

export const DoctorSchedule = mongoose.model("DoctorSchedule", DoctorScheduleSchema);


export const DoctorInformation  = mongoose.model("DoctorInformation", DoctorSchema);
