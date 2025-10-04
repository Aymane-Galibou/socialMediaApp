import CryptoJS from "crypto-js";

export const encryptPhone = async ({
  phone,
  phoneSecret = process.env.PHONE_KEYENCRYPTION,
}) => {
  return CryptoJS.AES.encrypt(phone, phoneSecret).toString();
};
