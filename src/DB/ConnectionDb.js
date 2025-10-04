import mongoose from "mongoose";


export const connectionDB=async()=>{
    try {
        await mongoose.connect(process.env.URI)
        console.log("connection to DB etablished successfuly")
        
    } catch (error) {
        console.log("Failed Connection to DB",error.message);
        
        
    }

}