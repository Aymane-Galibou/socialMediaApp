import eventEmitter from 'events'
import { html } from '../services/emailTemplate.js';
import { sendEmail } from '../services/sendEmail.js';
import { Hash } from './hashing/hash.js';
import { customAlphabet } from 'nanoid'
import { userModel } from '../DB/models/user.model.js';

export const sendEmailEvent=new eventEmitter();

// event for email verification
sendEmailEvent.on("sendVerificationEmail", async (data) => {
  try {
    const { email } = data;

    // we generate an otp using nanoid library
    const code = customAlphabet("1234567890", 6)();
    
    // we should hash the otp before store it in database
    const hashedCode = await Hash({
      password: code,
      salt: parseInt(process.env.SALTROUND, 10),
    });

    // store the otp in database
    const userResponse = await userModel.updateOne({ email }, { otpEmail: hashedCode.toString() });
    if (userResponse.modifiedCount === 0) {
      throw new Error("Email not found", { cause: 404 });
    }

    // Send email
    await sendEmail(email, "Email Confirmation", html({ code,title:"Email Confirmation" }));
  } catch (err) {
    console.error("sendVerificationEmail failed:", err.message);
    sendEmailEvent.emit("error", err);
  }
});

// to confirm new email 
sendEmailEvent.on("confirmnewEmail", async (data) => {
  try {
    const { newEmail,oldEmail } = data;

    // we generate an otp using nanoid bibliotheque
    const code = customAlphabet("1234567890", 6)();
    
    // we should hash the otp before store it in database
    const hashedCode = await Hash({
      password: code,
      salt: parseInt(process.env.SALTROUND, 10),
    });

    
    // store the otp in database
    const userResponse = await userModel.updateOne({ email:oldEmail }, { otpnewEmail: hashedCode.toString() });
    if (userResponse.modifiedCount === 0) {
      throw new Error("Email not found", { cause: 404 });
    }

    // Send email
    await sendEmail(newEmail, "Email Confirmation", html({ code,title:"Confirm the new Email" }));
  } catch (err) {
    console.error("sendVerificationEmail failed:", err.message);
    sendEmailEvent.emit("error", err);
  }
});

// to confirm the old email 
sendEmailEvent.on("confirmoldEmail", async (data) => {
  try {
    const { oldEmail } = data;

    // we generate an otp using nanoid bibliotheque
    const code = customAlphabet("1234567890", 6)();
    
    // we should hash the otp before store it in database
    const hashedCode = await Hash({
      password: code,
      salt: parseInt(process.env.SALTROUND, 10),
    });


    // store the otp in database
    const userResponse = await userModel.updateOne({ email:oldEmail }, { otpoldEmail: hashedCode.toString() });
    if (userResponse.modifiedCount === 0) {
      throw new Error("Email not found", { cause: 404 });
    }

    // Send email
    await sendEmail(oldEmail, "Email Confirmation", html({ code,title:"Email Confirmation" }));
  } catch (err) {
    console.error("sendVerificationEmail failed:", err.message);
    sendEmailEvent.emit("error", err);
  }
});

// event for forgot password
sendEmailEvent.on("forgotPassword", async (data) => {
  try {
    const { email } = data;

    // we generate an otp using nanoid bibliotheque
    const code = customAlphabet("1234567890", 6)();
    
    // we should hash the otp before store it in database
    const hashedCode = await Hash({
      password: code,
      salt: parseInt(process.env.SALTROUND, 10),
    });

    // store the otp in database
    const userResponse = await userModel.updateOne({ email }, { otpPassword: hashedCode });
    if (userResponse.modifiedCount === 0) {
      throw new Error("Email not found", { cause: 404 });
    }
    // Send email
    await sendEmail(email, "Forget Password", html({ code,title:"Forget Password" }));
  } catch (err) {
    console.error("sendVerificationEmail failed:", err.message);
    sendEmailEvent.emit("error", err);
  }
});
