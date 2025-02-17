import mongoose, {Schema} from "mongoose";



const prescriptionSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    AppointmentID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointment',
    },
    prescriptionName:{
        type:String,
        required: [true,'Prescription name is required']
    },
    medications: [{
        MedicationName: {  
            type: String,
            required: true
        },
        MedicationDosage: {
            type: String,
        },
        medication: {
            type: String,
        },
        frequency: {
            type: String,
        },
        duration: {
            type: String,
        },
        instructions: {
            type: String,
        }
    }],
    date: {
        type:Date,
    },
    notes: {
        type:String
    },
    status: {
        type:String,
    },
    prescriptionImages:{
        type:String,
    }

},{timestamps:true})




export const prescription = mongoose.model('prescription', prescriptionSchema);