import Joi from 'joi'
import { generaleRules } from "../../utils/generaleRules/index.js";
import { Types } from 'mongoose';


export const addPostSchema=Joi.object({
    content:Joi.string().min(3).required(),
    files:Joi.array().items(generaleRules.file).required()
})

export const updatepostSchema=Joi.object({
    content:Joi.string().min(3),
    files:Joi.array().items(generaleRules.file),
    postId:Joi.string().length(24).required()
})

const method = (value, helper) => {
  const truthy = Types.ObjectId.isValid(value);
  return truthy ? true : helper.error("string.mongo");
};

export const likeGraphQLSchema=Joi.object({
     postId:Joi.string().custom(method).messages({ "string.mongo": "this is Is not valide" }).required(),
    authorization:Joi.string().required(),
    accessRole:Joi.array().items(Joi.string()).required()
})