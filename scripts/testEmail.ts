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
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.TEST_EMAIL_TO || process.env.GMAIL_EMAIL,
      subject: "✅ Gmail test email",
      text: "This email is sent using Gmail + Nodemailer!",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error sending email:", error);
    }
  }
}

main();
