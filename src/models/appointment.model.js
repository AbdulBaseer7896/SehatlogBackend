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
    appointmentTime: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid 24-hour format time (HH:mm)`
        }
    },
    reason: {
        type: String,
        required: true
    },
    symptoms: {
        type: [String] // List of symptoms as strings
    },
    medication: {
        type: [String] // List of medications as strings
    },
    diagnosis: {
        type: String
    },
    prescription: {
        type: String
    },
    comments: {
        type: String
    },
    notes: {
        type: String
    },
    documentPath: {
        type: String // Path to uploaded documents (e.g., lab reports)
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "canceled"],
        default: "scheduled"
    }
}, { timestamps: true });

// Create and export the Appointment model
export const Appointment = mongoose.model("Appointment", AppointmentSchema);
