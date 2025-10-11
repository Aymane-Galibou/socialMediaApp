

export const asyncHandler=(fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch(next)
    }
}

export class appError extends Error{

    constructor(message,statusCode){
        super(message)
        this.message=message
        this.cause=statusCode
    }
}

export const globalErrorHandel=(err,req,res,next)=>{
    if(process.env.MODE==="DEV"){
   return res.status(err["cause"]||500).send({success:false,ErrorMessage:err.message,stack:err.stack})
    }
    return res.status(err["cause"]||500).send({ErrorMessage:err.message})

}