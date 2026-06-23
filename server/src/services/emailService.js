import nodemailer from 'nodemailer';

export async function sendOtpEmail(email, otp) {
  const message = `Your Scanly verification code is ${otp}. Valid for 10 minutes. Do not share this code.`;

  // Provide an ethereal testing account if real credentials don't exist
  let transporter;
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[DEV MODE] Ethereal Email test account created: ${testAccount.user}`);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Scanly Auth" <no-reply@scanly.com>',
      to: email,
      subject: 'Scanly Verification Code',
      text: message,
    });
    
    if (info.messageId && !process.env.SMTP_USER) {
      console.log(`[DEV OTP] Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Email Error:', error.message);
    throw new Error(`Failed to send Email via Nodemailer: ${error.message}`);
  }
}
