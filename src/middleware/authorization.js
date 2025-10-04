import { asyncHandler } from "../utils/globalErrorHandling/index.js";

export const authorization=(acceptedRole=[])=>{
    return asyncHandler((req,res,next)=>{
    const {user}=req;
    if(!user){
        return next(new Error("Authentication is Required , access Denied",{cause:400}))
    }
    if(!acceptedRole.includes(user.role)){
        return next(new Error("Access denied, you are not authorized",{cause:400}))
    }
    next()

})
}
