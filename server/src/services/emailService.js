import nodemailer from 'nodemailer';

/**
 * Creates a production-ready Nodemailer transporter.
 *
 * On Render and other cloud platforms, port 587 (STARTTLS) is often firewalled.
 * We prefer port 465 (SSL/TLS) which works reliably on all hosting providers.
 *
 * Fallback: if no SMTP credentials are configured, logs OTP to console
 * (useful for local development without an email account).
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[EMAIL] No SMTP credentials found. OTPs will be logged to console only.');
    return null;
  }

  const port = parseInt(SMTP_PORT || '465', 10);
  const secure = port === 465; // true for 465 (SSL), false for 587 (STARTTLS)

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // These options are critical for Render/cloud hosting reliability:
    connectionTimeout: 10000,  // 10s to connect
    greetingTimeout: 10000,    // 10s for greeting
    socketTimeout: 15000,      // 15s for socket
    tls: {
      // Don't fail on self-signed certs
      rejectUnauthorized: false,
    },
  });
}

export async function sendOtpEmail(email, otp) {
  const fromEmail = (process.env.FROM_EMAIL || 'scanly.auth.bot@gmail.com').replace(/"/g, '').trim();
  const message = `Your Scanly verification code is: ${otp}\n\nValid for 10 minutes. Do not share this code with anyone.`;

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

  const transporter = createTransporter();

  // DEV mode: no SMTP configured, just log to console
  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[DEV OTP] To: ${email}`);
    console.log(`[DEV OTP] Code: ${otp}`);
    console.log(`========================================\n`);
    return { success: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Scanly Auth" <${fromEmail}>`,
      to: email,
      subject: `${otp} is your Scanly verification code`,
      text: message,
      html: htmlMessage,
    });

    console.log(`[EMAIL] Sent to ${email} — MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send to ${email}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}
