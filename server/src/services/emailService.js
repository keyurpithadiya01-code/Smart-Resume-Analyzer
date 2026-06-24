import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email, otp) {
  if (!process.env.RESEND_API_KEY) {
    // DEV fallback — log to console if no API key
    console.log('\n====================================');
    console.log(`[DEV OTP] Email : ${email}`);
    console.log(`[DEV OTP] Code  : ${otp}`);
    console.log('====================================\n');
    return { success: true, dev: true };
  }

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; color: #fff; border-radius: 12px;">
      <h2 style="margin: 0 0 8px; color: #fff; font-size: 22px;">Your verification code</h2>
      <p style="color: #aaa; margin: 0 0 24px; font-size: 14px;">Enter this code to verify your Scanly account.</p>
      <div style="font-size: 40px; font-weight: 700; letter-spacing: 10px; text-align: center; background: #1a1a1a; padding: 20px; border-radius: 8px; color: #00ffa3; margin-bottom: 24px;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 12px; margin: 0;">This code expires in <strong style="color:#aaa">10 minutes</strong>. If you didn't request this, ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Scanly <noreply@scanlyresume.xyz>',
      to: [email],
      subject: `${otp} is your Scanly verification code`,
      html: htmlMessage,
      text: `Your Scanly verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    });

    if (error) {
      console.error('[RESEND ERROR]', JSON.stringify(error));
      throw new Error(error.message || 'Resend rejected the request');
    }

    console.log(`[EMAIL] Sent to ${email} — id: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] ${err.message}`);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
}