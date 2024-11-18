import mongoose, {Schema} from "mongoose";





const vaccinationSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // doctorId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Doctor',
    // },
    vaccineName : {
        type:String,
        required: [true, "Please enter a Vaccine Name"],
    },
    vaccineType: {
        type:String,
    },
    dataAdministered: {
        type:Date
    },
    totalDoses: {
        type:Number,
        required: [true, "Please enter Total Doses"],
    },
    firstDoseDate:{
        type:Date,
    },
    upcomingDates:{
        type:String,
    },
    description:{
        type:String,
    },
    status:{
        type:String
    },
    vaccinePic: {
        type:[String],
    },

},{timestamps:true})




export const vaccination = mongoose.model('vaccination', vaccinationSchema);