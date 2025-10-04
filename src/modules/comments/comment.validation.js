import Joi from 'joi'
import { generaleRules } from "../../utils/generaleRules/index.js";

export const addCommentSchema=Joi.object({
    content:Joi.string().min(3).required(),
    files:Joi.array().items(generaleRules.file).required(),
    postId:Joi.string().length(24).required(),
    commentId:Joi.string().length(24)

})

export const updateCommentSchema=Joi.object({
    content:Joi.string().min(3),
    files:Joi.array().items(generaleRules.file),
    commentId:Joi.string().length(24).required()
})