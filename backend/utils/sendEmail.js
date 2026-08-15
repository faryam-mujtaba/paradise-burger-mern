const nodemailer = require("nodemailer");

const getEmailCredentials = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASS is missing from the backend .env file"
    );
  }

  return { user, pass };
};

const { user, pass } = getEmailCredentials();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user,
    pass,
  },
});

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("SMTP SERVER READY TO SEND EMAIL");
    return true;
  } catch (error) {
    console.error("SMTP CONNECTION ERROR:", error.message);
    return false;
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error("Email receiver address is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  try {
    const result = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"Paradise Burger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("EMAIL SENT SUCCESSFULLY:", result.messageId);

    return result;
  } catch (error) {
    console.error("SEND EMAIL ERROR:", {
      code: error.code,
      responseCode: error.responseCode,
      message: error.message,
    });

    throw error;
  }
};

sendEmail.verifyConnection = verifyEmailConnection;

module.exports = sendEmail;