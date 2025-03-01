import mongoose, {Schema} from "mongoose";



const myFamilySchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    familyMemberUserId: { // Add this field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName : {
        type:String,
        required: [true, "Please enter a Full"],
    },
    relationship: {
        type:String,
        required: [true, "Please enter a RelationShip"],
    },
    dateOfBirth: {
        type:Date,
        required: [true, "Please enter a Data of Birth"],
    },
    gender: {
        type:String,
        required: [true, "Please enter a Gender"],
    },

},{timestamps:true})






export const myFamily = mongoose.model('myFamily', myFamilySchema);