import nodemailer from "nodemailer";


export async function sendEmail(Receiver, subject, html, attachments) {
  try {
    if (!Receiver) throw new Error("Receiver email is required");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.APP_PASSWORD,
      },
    });
// hadi maxi daroriya gher in case bgheti tverifier wach configuration dyal transporter s7i7a
    await transporter.verify(); 

    const info = await transporter.sendMail({
      from: `"Lgmada" <${process.env.EMAIL_SENDER}>`,
      to: Receiver,
      subject: subject || "Hello",
      html: html || "<h1>Something went wrong</h1>",
      attachments: attachments || [],
    });

    return info.accepted.length > 0;
  } catch (err) {
    console.error("Email sending failed:", err.message);
    return false;
  }
}

