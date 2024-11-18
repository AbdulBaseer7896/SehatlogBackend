import mongoose, {Schema} from "mongoose";



const hospitalRecordSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // doctorId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Doctor',
    // },
    hospitalName : {
        type:String,
        required: [true, "Please enter a Hospital Name"],
    },
    dateOfAdmission: {
        type:Date,
    },
    dateOfDischarge: {
        type:Date
    },
    admissionNotes: {
        type:String,
    },
    dischargeNotes: {
        type:String,
    },
    status: {
        type:String,
    },
    description: {
        type:String,
    },
    hospitalDocumentsPic:{
        type:[String],
    }

},{timestamps:true})






export const hospitalRecord = mongoose.model('hospitalRecord', hospitalRecordSchema);