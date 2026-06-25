const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are missing in .env file");
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      `"Paradise Burger" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("EMAIL SENT SUCCESSFULLY");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);

  return info;
};

module.exports = sendEmail;