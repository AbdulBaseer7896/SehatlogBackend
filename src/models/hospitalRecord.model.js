import mongoose, {Schema} from "mongoose";



const hospitalRecordSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    hospitalName : {
        type:String,
        required: [true, "Please enter a Hospital Name"],
    },
    dataOfAdmission: {
        type:Date,
    },
    dataOfDischarge: {
        type:Date
    },
    status: {
        type:String,
    },
    otherDocumentsImages:{
        type:String,
    }

},{timestamps:true})




export const hospitalRecord = mongoose.model('hospitalRecord', hospitalRecordSchema);