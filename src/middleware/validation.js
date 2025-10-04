import { appError } from "../utils/globalErrorHandling/index.js";


export const validation = (schema) => {
  return (req, res, next) => {
    const reqObj = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...(req.file && { file: req.file }),
      ...(req.files && { files: req.files }),
    };

    const { error } = schema.validate(reqObj, { abortEarly: false });
    if (error) {
      const validationResults = error.details.map((detail) => detail.message);
      return next(new appError(validationResults,400))

    }
    next();
  };
};



export const validationGraphQL = async({schema,body}) => {

    const { error } = schema.validate(body, { abortEarly: false });
    if (error) {
       throw new appError(error.message,400)
    }
    return {}
  
};
