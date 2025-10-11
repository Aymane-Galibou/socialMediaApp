import { nanoid } from "nanoid";
import { rolesTypes, userModel } from "../../DB/models/user.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { sendEmailEvent } from "../../utils/emailEvent.js";
import { encryptPhone } from "../../utils/encryption/encrypt.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";
import { compare } from "../../utils/hashing/compare.js";
import { Hash } from "../../utils/hashing/hash.js";
import { decodeToken } from "../../utils/token/decodeToken.js";
import { generateToken } from "../../utils/token/generateToken.js";
import { postModel } from "../../DB/models/post.model.js";

// START registration function
export const addUser = async (req,res,next)=>{
    const {name,email,password,confirmPassword,gender,role}=req.body;
    // check if password and confirmedPassword are the same
    if(password!==confirmPassword){
        return next(new Error("Password and Confirmed Password are not the same",{cause:400}))
    }

    // check if email already exist
        const existEmail=await userModel.findOne({email})
        if(existEmail){
            return next(new Error("Email already exist",{cause:409}))
        }
    // hash password
    const hashedPassword=await Hash({password,salt:parseInt(process.env.SALTROUND)})  
    


    //verify profile upload 
        if(!req.file){
            return next(new Error("Profile Image is not found",{cause:400}))       
           }

      // store image in cloudinary 
      const ImageData=await cloudinary.uploader.upload(req.file.path,{folder:"socialMediaApp/users"})
          
      const {public_id,secure_url}=ImageData

    // create user
    const user=await userModel.create({name,email,password:hashedPassword,gender,role,image:{secure_url,public_id}})

    // send verification code to user email
    sendEmailEvent.emit("sendVerificationEmail",{email})



    return res.status(201).json({message:"User created successfully",user})

}

// START function that handles email Confirmation
export const confirmEmail=asyncHandler(async (req,res,next)=>{
    const {email,verificationCode}=req.body;

    const User=await userModel.findOne({email,confirmed:false}).lean()
    if(!User){
       return next(new Error("Email not exist or already confirmed"))
    }
    
    const isMatched=await compare({password:verificationCode,hashedPassword:User.otpEmail})

    if(!isMatched){
        return next(new Error("The code that you have enter is not correct"))
    }
    const newUser=await userModel.findOneAndUpdate({email,confirmed:false},{confirmed:true,$unset:{otpEmail:0}},{new:true}).select(["name","gender","email"])

    return res.status(200).send({statusMessage:"User Confirmed Successfuly",newUser})

})
 
// START function that handles signin
export const login=asyncHandler( async(req,res,next)=>{ 
    const {email,password}=req.body

    const user=await userModel.findOne({email,confirmed:true}).lean()

// this condition for not existin user 
    if (!user) return next(new Error("User not found", { cause: 404 }));

// this condition for not confirmed user
    if (!user.confirmed) return next(new Error("User not confirmed", { cause: 403 }));

// we should verify also the password if it equal the one in db or not 
    const matchedPassword=await compare({password,hashedPassword:user.password})

    if(!matchedPassword){
        return next(new Error("Password is Not Correct",{cause:401}))
    }
    // generatin accessToken and also refresh Token
    const accessSignature=user.role ===rolesTypes.user ? process.env.ACCESS_USER_SIGNATURE :process.env.ACCESS_ADMIN_SIGNATURE
    const refreshSignature=user.role ===rolesTypes.user ? process.env.REFRESH_USER_SIGNATURE :process.env.REFRESH_ADMIN_SIGNATURE

    const accessToken=await generateToken({payload:{email,id:user._id,role:user.role},signature:accessSignature,option:{expiresIn:"1h"}})
    const refreshToken=await generateToken({payload:{email,id:user._id,role:user.role},signature:refreshSignature,option:{expiresIn:"1w"}})

    return res
      .status(200)
      .send({
        StatusMessage: "Login Successfult",
        UserInformation: { ...user, password:"not allowed" },
        accessToken,
        refreshToken,
      });

}) 

// START function that refresh Token
export const tokenRefresher=asyncHandler( async(req,res,next)=>{ 
    const {refreshToken}=req.body
    if(!refreshToken){
        return next(new Error("the refresh Token is required",{cause:400}))
    }

  const [prefix, token] = refreshToken.split(" ");
  if (!prefix || !token) {
    return next(new Error("Token Not Founded", { cause: 404 }));
  }

  
// this part to decode the refresh token coming in the request 
  let secret;
  if (prefix === "user") secret = process.env.REFRESH_USER_SIGNATURE;
  else if (prefix === "admin") secret = process.env.REFRESH_ADMIN_SIGNATURE;
  else return next(new Error("Invalide Token Type", { cause: 401 }));

  const decodedToken = await decodeToken({token,signature:secret})
  if (!decodedToken?.id) {
    return next(new Error("Invalide Token Payload", { cause: 401 }));
  }


  // verifyin if the user exist or not based on the coming refresh token
  const user=await userModel.findById(decodedToken.id).lean()
  if(!user){
    return next(new Error("User Not Found",{cause:404}))
  }

    // generatin a new accessToken based on the coming refresh token
    const signature=user.role ===rolesTypes.user ? process.env.ACCESS_USER_SIGNATURE :process.env.ACCESS_ADMIN_SIGNATURE
    const accessToken=await generateToken({payload:{email:decodedToken.email,id:user._id,role:user.role},signature,option:{expiresIn:"1h"}})

    return res
      .status(200)
      .send({
        StatusMessage: "Token refreshed successfuly",
        UserInformation: { ...user, password:"not allowed" },
        accessToken,
      });

})

// START function that handles forgot password part
export const forgetPassword=asyncHandler( async(req,res,next)=>{ 
    const {email}=req.body
    const user=await userModel.findOne({email,confirmed:true,isDeleted:false}).lean()

// this condition for not existin user 
    if (!user) return next(new Error("User not found", { cause: 404 }));

// event that sent the otpPassword to email
sendEmailEvent.emit("forgotPassword",{email})

    return res
      .status(200)
      .send({
        ok:true,
        StatusMessage: "Check your Email,we sent to you a verification code",
      });

}) 

// START function that handles reseting password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { verificationCode, email, password, confirmPassword } = req.body;
  // at begining we check if the newpassword & confirmed password are equal or not , to reduce number of request on the DB
  if (password !== confirmPassword) {
    return next(
      new Error("Password and Confirmed Password are not the same", {
        cause: 400,
      })
    );
  }
  // to check if a user with this email exits or not
  const user = await userModel
    .findOne({ email, isDeleted: false })
    .lean();
  if (!user) return next(new Error("User not found", { cause: 404 }));
  // check if the user receive the otp password in his email and passed by forget password step

  if (!user.otpPassword) {
    return next(
      new Error("You didn't pass by forget password Step", { cause: 402 })
    );
  }

  // to check if the resetCode is equal to otpPassword which is in DB
  const isMatched = compare({
    password: verificationCode,
    hashedPassword: user.otpPassword,
  });
  if (!isMatched) {
    return next(new Error("Reset code is not correct", { cause: 401 }));
  }
  // to hash the new Password
  const newPassword = await Hash({
    password,
    salt: parseInt(process.env.SALTROUND),
  });
  //to update the password in DB and also confirm it if it's not 
  const newUser = await userModel
    .findOneAndUpdate(
      { email },
      { password: newPassword, confirmed:true,$unset: { otpPassword: 0 } },
      { new: true }
    )
    .lean();

  return res.status(200).send({
    ok: true,
    StatusMessage: "You Password is Updated Successfuly",
    UserInformation: { ...newUser, password: "not allowed" },
  });
});

// START function that handles profile update
export const updateProfile = asyncHandler(async (req, res,next) => {
  let updateData={}
  const {name,gender}=req.body

if(name){
  updateData.name=name
}
if(gender){
  updateData.gender=gender
}

      // store image in cloudinary 
      const ImageData=await cloudinary.uploader.upload(req.file.path,{folder:"socialMediaApp/users"})
          
      const {public_id,secure_url}=ImageData

const newUser=await userModel.findByIdAndUpdate(req.user._id,{...updateData,image:{public_id,secure_url}},{new:true})
  if (!newUser) {
    return next(
      new Error("Unable to update profile. Please verify you are signed in.")
    );
  }
  return res.status(200).send({
    message: "Profile Update Successfuly",
    user: newUser,
  });
});

// START function that handles profile update
export const addFriend = asyncHandler(async (req, res,next) => {
  const {friendId}=req.params

const newUser=await userModel.findOneAndUpdate({_id:friendId,isDeleted:false},{$addToSet:{friends:req.user._id}},{new:true})
  if (!newUser) {
    return next(
      new Error("Unable to add this Friend. Please verify is that friend exist or not")
    );
  }
  await userModel.findOneAndUpdate({_id:req.user._id,isDeleted:false},{$addToSet:{friends:friendId}},{new:true})
  return res.status(200).send({
    message: "You add it To your Friends",
    user: req.user,
  });
});

// START function that handles updating password
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { newPassword,confirmedNewPassword,oldPassword } = req.body;
  
  const {_id,email}=req.user

  // at begining we check if the newpassword & confirmed password are equal or not , to reduce number of request on the DB
  if (newPassword !== confirmedNewPassword) {
    return next(
      new Error("Password and Confirmed Password are not the same", {
        cause: 400,
      })
    );
  }
  // to check if a user with this email exits or not
  const user = await userModel.findOne({ email, isDeleted: false }).lean();

  if (!user) return next(new Error("User not found", { cause: 404 }));

// we should verify also the password if it equal the one in db or not 
    const matchedPassword=await compare({password:oldPassword,hashedPassword:user.password})

    if(!matchedPassword){
        return next(new Error("old Password is Not Correct",{cause:401}))
    }

  // to hash the new Password
  const hashedPassword = await Hash({
    password:newPassword,
    salt: parseInt(process.env.SALTROUND),
  });

  //to update the password in DB and also confirm it if it's not 
  const newUser = await userModel.findOneAndUpdate({ email,_id },{ password: hashedPassword, confirmed:true,passwordChangedAt:Date.now() },{ new: true }).lean();

  return res.status(200).send({
    ok: true,
    StatusMessage: "You Password is Updated Successfuly",
    UserInformation: { ...newUser, password: "not allowed" },
  });
});

// START function that shows profile
export const showProfile=asyncHandler(async (req,res,next)=>{
  const {id}=req.params
  const user=await userModel.findOne({_id:id},{email:0,password:0,passwordChangedAt:0})
  if (!user) {
    return next(
      new Error("This Profile is not exist",{cause:404})
    );
  }

  const viewersExist=user.viewers.find((viewer)=>viewer.userId.toString() === req.user._id.toString())

  // first cdt is to verify if the owner is not the vistor to prevent a owner to become viwer of himself
if(req.user._id.toString() !== id ){
if(viewersExist){
  viewersExist.time.push(new Date())
  if(viewersExist.time.length >5){
   viewersExist.time= viewersExist.time.slice(-5)
  }

}else{
  user.viewers.push({userId:req.user._id,time:[new Date()]})
}
}



await user.save()

  if(req.user._id.toString()==id){    
    return res.status(200).send({
    message: "Profile Fetched Successfuly",
    userInformation:req.user,
  });
  }

return res.status(200).send({
    message: "Profile Fetched Successfuly",
    userInformation:user,
  });

})

// START function that shows profile
export const getProfile=asyncHandler(async (req,res,next)=>{
  
  const user=await userModel.findOne({_id:req.user._id},{email:0,password:0,passwordChangedAt:0}).populate([{path:"friends"}])
  if (!user) {
    return next(
      new Error("This Profile is not exist",{cause:404})
    );
  }


return res.status(200).send({
    message: "Profile Fetched Successfuly",
    userInformation:user,
  });

})

// START function that handles updating email
export const updateEmail = asyncHandler(async (req, res, next) => {
  const { newEmail, oldEmail } = req.body;
  const user = await userModel.findOne({ email: newEmail }).lean();
  if (user) {
    return next(new Error("This Profile is already exist", { cause: 409 }));
  }

  // send otp to new email
   sendEmailEvent.emit("confirmnewEmail", {newEmail,oldEmail});

  // send otp to old email
  sendEmailEvent.emit("confirmoldEmail", { oldEmail });

  // we store the newEmail in the pendingEmail field till we verify the two otps
  await userModel.findByIdAndUpdate(req.user._id, { pendingEmail: newEmail });

  return res.status(200).send({
    message: "Profile Fetched Successfuly",
    userInformation: req.user,
  });
});

// START function that replaces emails
export const replaceEmail = asyncHandler(async (req, res, next) => {
  const { newOtp, oldOtp } = req.body;
  const user = await userModel.findOne({ _id: req.user._id }).lean();
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const isMatchedOldOtp = await compare({
    password: oldOtp,
    hashedPassword: user.otpoldEmail,
  });
  const isMatchedNewOtp = await compare({
    password: newOtp,
    hashedPassword: user.otpnewEmail,
  });

  if (!isMatchedOldOtp) {
    return next(new Error("otp of old email is not correct ", { cause: 500 }));
  }

  if (!isMatchedNewOtp) {
    return next(new Error("otp of new email is not correct ", { cause: 500 }));
  }

  // we replace the email with the email stored in pending field
  const newUser = await userModel
    .findByIdAndUpdate(
      req.user._id,
      {
        email: req.user.pendingEmail,
        $unset: { pendingEmail: 0, otpoldEmail: 0, otpnewEmail: 0 },
        passwordChangedAt:Date.now()
      },
      { new: true }
    )
    .lean();

  return res.status(200).send({
    message: "Youe Email is updated Successfuly",
    userInformation: { ...newUser, password: "*******" },
  });
});

// START dashboard

// get posts and users 
export const getDashboard=asyncHandler(async(req,res,next)=>{

  const [posts,users]=await Promise.all([postModel.find().lean(),userModel.find().select("name email gender role image passwordChangedAt")]) 
  return res.status(200).send({success:true,message:"Welcome to Dahboard , everything is fetched successfuly",posts,users})
})

// update role 
export const updateRole=asyncHandler(async(req,res,next)=>{
  const {userId}=req.params
  const {role}=req.body

  const condition=req.user.role===rolesTypes.superAdmin ? {role:{$nin:[rolesTypes.superAdmin]}} : {role:{$nin:[rolesTypes.admin,rolesTypes.superAdmin]}}

  const result=await userModel.findOneAndUpdate({_id:userId,isDeleted:false,...condition},{role,updatedBy:req.user._id},{new:true}).select("name email gender role image passwordChangedAt"); 
    if (!result) return next(new Error("User not found or Deleted", { cause: 404 }));

  return res.status(200).send({success:true,message:"You updated Role successfuly",newUser:result})
})

