import Joi from "joi";


export const generaleRules={
    file:{
            size: Joi.number().positive().required(),
            path: Joi.string().required(),
            filename: Joi.string().required(),
            destination: Joi.string().required(),
            mimetype: Joi.string().required(),
            encoding: Joi.string().required(),
            originalname: Joi.string().required(),
            fieldname: Joi.string().valid("image","images").required(),
    }
}