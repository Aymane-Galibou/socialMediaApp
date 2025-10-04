import jwt from "jsonwebtoken";
import { rolesTypes, userModel } from "../DB/models/user.model.js";
import { decodeToken } from "../utils/token/decodeToken.js";
import { asyncHandler } from "../utils/globalErrorHandling/index.js";


export const authenticate = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  const [prefix, token] = authorization.split(" ");
  if (!prefix || !token) {
    return next(new Error("Token Not Founded", { cause: 404 }));
  }
  
  let signature;
  if (prefix === "user") signature = process.env.ACCESS_USER_SIGNATURE;
  else if (prefix === "admin") signature = process.env.ACCESS_ADMIN_SIGNATURE;
  else return next(new Error("Invalide Token Type", { cause: 401 }));

  const decodedToken = await decodeToken({token,signature})
  
  if (!decodedToken?.id) {
    return next(new Error("Invalide Token Payload", { cause: 401 }));
  }
  const UserInfo = await userModel.findOne(
    { email: decodedToken.email }
  ).lean();
  if (!UserInfo) {
    return next(new Error("User Not found", { cause: 404 }));
  }
  // verify if the account is freezed or not 
  if(UserInfo?.isDeleted){
    return next(new Error("This account is Freezed", { cause: 404 }));
  }

  // destroy token after changing password
  if(parseInt(UserInfo.passwordChangedAt?.getTime() / 1000) > decodedToken.iat){
    return next(new Error("Token expired , sign in again", { cause: 400 }));
}

  req.user = UserInfo;
  
  next();
});

export const authorization = (accessRole = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRole.includes(req.user.role)) {
      return next(new Error("Access Denied", { cause: 400 }));
    }
    next();
  });
};


export const authGraphql=async ({authorization,accessRole=["admin","user"]}) => {

  const [prefix, token] = authorization.split(" ");
  if (!prefix || !token) {
    throw new Error("Token Not Founded", { cause: 404 })
  }
  
  let signature;
  if (prefix === rolesTypes.user) signature = process.env.ACCESS_USER_SIGNATURE;
  else if (prefix === rolesTypes.admin) signature = process.env.ACCESS_ADMIN_SIGNATURE;
  else throw new Error("Invalide Token Type", { cause: 401 })

  const decodedToken = await decodeToken({token,signature})
  
  if (!decodedToken?.id) {
    throw new Error("Invalide Token Payload", { cause: 401 })
  }
  const UserInfo = await userModel.findOne(
    { email: decodedToken.email }
  ).lean();
  if (!UserInfo) {
    throw new Error("User Not found", { cause: 404 })
  }
  // verify if the account is freezed or not 
  if(UserInfo?.isDeleted){
    throw new Error("This account is Freezed", { cause: 404 })
  }

  // destroy token after changing password
  if(parseInt(UserInfo.passwordChangedAt?.getTime() / 1000) > decodedToken.iat){
    throw new Error("Token expired , sign in again", { cause: 400 })
}

  if (!accessRole.includes(UserInfo.role)) {
     throw  new Error("Access Denied", { cause: 400 });
    }
return UserInfo
}
