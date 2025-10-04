import {Router} from "express"
import { validation } from "../../middleware/validation.js"
import * as US from './index.js'
import { fileTypes, multerCloudinary } from "../../middleware/multer.js"
import { authenticate } from "../../middleware/auth.js"
import { authorization } from "../../middleware/authorization.js"
import { rolesTypes } from "../../DB/models/user.model.js"

export const userRouter=Router()

// register
userRouter.post("/signup",multerCloudinary(fileTypes.image).single("image"),validation(US.signupSchema),US.addUser)

// email otp
userRouter.patch("/emailverification",validation(US.confirmEmailSchema),US.confirmEmail)

// login 
userRouter.post("/signin",validation(US.loginSchema),US.login)

// refresh token
userRouter.post("/refreshToken",US.tokenRefresher)

// forgot  password 
userRouter.put("/forgetPassword",US.forgetPassword)

// reset password
userRouter.patch("/resetPassword",validation(US.resetPasswordSchema),US.resetPassword)

// show profile
userRouter.get("/profile/:id",authenticate,US.showProfile)

//update Profile information
userRouter.patch("/profile/update",multerCloudinary(fileTypes.image).single("image"),validation(US.updateProfileSchema),authenticate,US.updateProfile);

// update password 
userRouter.put("/profile/updatePassword",validation(US.updatePasswordSchema),authenticate,US.updatePassword)

// update email 
userRouter.patch("/profile/updateEmail",validation(US.updateEmailSchema),authenticate,US.updateEmail)

// confirm Email 
userRouter.post("/profile/replaceEmail",validation(US.replaceEmailSchema),authenticate,US.replaceEmail)

// dashboard
userRouter.get("/dashboard",authenticate,authorization([rolesTypes.admin]),US.getDashboard)

userRouter.patch("/dashboard/updateRole/:userId",authenticate,authorization([rolesTypes.admin,rolesTypes.superAdmin]),US.updateRole)




