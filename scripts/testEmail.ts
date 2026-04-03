import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: "sonw80594@gmail.com", // send to yourself first
      subject: "✅ Gmail test email",
      text: "This email is sent using Gmail + Nodemailer!",
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
