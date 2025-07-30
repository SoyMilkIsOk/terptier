import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM;

if (!apiKey || !from) {
  throw new Error("Resend environment variables are missing");
}

const resend = new Resend(apiKey);

export async function sendEmail(to: string, subject: string, text: string) {
  await resend.emails.send({
    from,
    to,
    subject,
    text,
  });
}
