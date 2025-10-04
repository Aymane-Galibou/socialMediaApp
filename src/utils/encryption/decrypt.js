import CryptoJS
 from "crypto-js";


export const decryptPhone=async ({phone,secretPhone=process.env.PHONE_KEYENCRYPTION})=>{

   return  CryptoJS.AES.decrypt(
          phone,
          secretPhone
        ).toString(CryptoJS.enc.Utf8);

}