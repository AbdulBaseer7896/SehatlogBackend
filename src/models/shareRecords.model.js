

import mongoose, { Schema } from "mongoose";

const sharedRecordSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    }],
    reportsData: [
        {
            _id: { type: String, required: true },
            patientId: { type: String, required: true }
        }
    ],
    prescriptionsData: [
        {
            _id: { type: String, required: true },
            patientId: { type: String, required: true }
        }
    ],
    upcomingVaccinationsData: [
        {
            _id: { type: String, required: true },
            patientId: { type: String, required: true }
        }
    ],
    completedVaccinationsData: [
        {
            _id: { type: String, required: true },
            patientId: { type: String, required: true }
        }
    ]
}, { timestamps: true });

export const sharedRecord = mongoose.model('SharedRecord', sharedRecordSchema);

