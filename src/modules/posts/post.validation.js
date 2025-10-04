import Joi from 'joi'
import { generaleRules } from "../../utils/generaleRules/index.js";

export const addPostSchema=Joi.object({
    content:Joi.string().min(3).required(),
    files:Joi.array().items(generaleRules.file).required()
})

export const updatepostSchema=Joi.object({
    content:Joi.string().min(3),
    files:Joi.array().items(generaleRules.file),
    postId:Joi.string().length(24).required()
})