import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
        reportName: {
            type: String,
            required: [true, "Please enter a Report Name"],
        },
        reportType: {
            type: String,
        },
        reportDate: {
            type: Date,
        },
        findings: {
            type: String,
        },
        testName: {
            type: String,
        },
        resultValue: {
            type: String,
        },
        units: {
            type: String,
        },
        referenceRange: {
            type: String,
        },
        description: {
            type: String,
        },
        notes: {
            type: String,
        },
        status: {
            type: String,
        },
        reportPics: {
            type: [String], // Array of strings to hold multiple image URLs
        },
    },
    { timestamps: true }
);

export const report = mongoose.model("report", reportSchema);
