import bcrypt from "bcryptjs";

export const compare=async({password,hashedPassword})=>{
    return bcrypt.compare(password,hashedPassword)
}