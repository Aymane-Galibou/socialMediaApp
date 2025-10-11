import { chatModel } from "../../DB/models/chat.model.js"


export const getChat=async(req,res,next)=>{
    const {userId}=req.params
    const chat=await chatModel.findOne({$or:[
        {mainUser:req.user._id,subParticipants:userId},
        {mainUser:userId,subParticipants:req.user._id}
    ]}).populate([{path:"mainUser"},{path:"convs.senderId"}])

    return res.status(201).send({message:"chat fetched Successfuly",chat})
}