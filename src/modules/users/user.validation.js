import Joi from "joi";
import { genderTypes, rolesTypes } from "../../DB/models/user.model.js";
import { generaleRules } from "../../utils/generaleRules/index.js";

export const signupSchema = Joi.object({
    name: Joi.string().min(3).max(30).messages({ "string.min": "Name is short" }).required(),
    password: Joi.string().min(3).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid(rolesTypes.user, rolesTypes.admin).required(),
    gender: Joi.string().valid(genderTypes.male, genderTypes.female).required(),
    file:Joi.object({...generaleRules.file}).required()
})

export const confirmEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    verificationCode:Joi.string().length(6).required(),
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
})

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    verificationCode:Joi.string().length(6).required(),
    password: Joi.string().min(3).required(),
    confirmPassword:Joi.string().valid(Joi.ref("password"))
})

export const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().min(3).required(),
    newPassword: Joi.string().min(3).required(),
    confirmedNewPassword:Joi.string().valid(Joi.ref("newPassword"))
})

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(3).max(15).messages({ "string.min": "Name is short" }),
    gender: Joi.string().valid("male", "female"),
   ...generaleRules.file

  })

export const updateEmailSchema = Joi.object({
    oldEmail: Joi.string().email().required(),
    newEmail: Joi.string().email().required(),
})

export const replaceEmailSchema = Joi.object({
    oldOtp: Joi.string().length(6).required(),
    newOtp: Joi.string().length(6).required(),
})



// export const updatePasswordSchema = {
//   body: Joi.object({
//     oldPassword: Joi.string().min(3).required(),
//     newPassword: Joi.string().min(3).required(),
//     confirmedNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
//   }),
//   headers: generalRules.headers.required(),
// };



// export const freezAccountSchema = {
//   headers: generalRules.headers.required(),
// };

// export const ShareProfileSchema = {
//   params: Joi.object({
//     id: generalRules.objectId.required(),
//   }),
// };
