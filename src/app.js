import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();


app.use(cors({
    origin :process.env.CORS_ORIGIN,
    credentials: true
}));



app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended : true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser())


// Routers import

import userRouter from './routers/user.router.js';
import patientRouter from './routers/patient.router.js';
import doctorRouter from './routers/doctor.router.js';
import appointmentRouter from './routers/appointment.router.js';



// router declarations
app.use('/api/v1/users', userRouter);
app.use('/api/v1/patient', patientRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/patient/appointment', appointmentRouter);


// Error handling middleware

export  {app}