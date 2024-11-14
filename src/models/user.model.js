import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    phone: {
        type:String,
        required: [true, "Please enter a phone"],
        unique: true,
        // lowercase: true,
        trim:true,
        // index:true
    },
    email: {
        type:String,
        required: [true, "Please enter a email"],
        unique: true,
        lowercase: true,
        trim:true,
    },
    fullName: {
        type:String,
        required: [true, "Please enter a fullname"],
        trim:true,
        index:true
    },
    password: {
        type:String,
        required: [true, "Please enter a Password"],
        required : true,
    },
    userRole: {
        type:String,
        required: [true, "Please enter a User Role"],
        enum: ["Doctor", "Patient"],
    },
    avatar: {
        type: String    
    },
    refreshToken:{
        type: String
    }
},{timestamps:true})


userSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}


userSchema.methods.generateAccessToken = function(){
    return  jwt.sign({
        _id: this._id,
        email: this.email,
        phone: this.phone,
        fullName: this.fullName,
        userRole: this.userRole
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}



userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign({
        _id: this._id,
        userRole: this.userRole
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}



export const User = mongoose.model('User', userSchema);