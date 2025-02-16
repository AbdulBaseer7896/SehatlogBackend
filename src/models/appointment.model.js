
import mongoose, { Schema } from "mongoose";


const AppointmentSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    startTime: {  // New field for start time
        type: String,
        required: true,
        validate: {
            validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
        }
    },
    endTime: {  // New field for end time
        type: String,
        required: true,
        validate: {
            validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
        }
    },
    reason: {
        // type: String,
        type: [String],
        required: true
    },
    symptoms: {
        type: [String]
    },
    medication: {
        type: [String]
    },
    diagnosis: {
        type: [String]
    },
    prescription: {
        type: [String]
    },
    comments: {
        type: String
    },
    notes: {
        type: String
    },
    documentPath: {
        type: [String]
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "canceled"],
        default: "scheduled"
    }
}, { timestamps: true });



export const Appointment = mongoose.model("Appointment", AppointmentSchema);
