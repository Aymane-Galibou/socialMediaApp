import bcrypt from "bcryptjs";


export const Hash=async({password,salt})=>{
    return  bcrypt.hash(password,salt)
}