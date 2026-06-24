import nodemailer from 'nodemailer';

/**
 * Creates a production-ready Nodemailer transporter.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      '[EMAIL] No SMTP credentials found. OTPs will be logged to console only.'
    );
    return null;
  }

  const port = parseInt(SMTP_PORT || '465', 10);
  const secure = port === 465;

  console.log('[EMAIL CONFIG]', {
    host: SMTP_HOST,
    port,
    secure,
    user: SMTP_USER,
  });

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,

    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },

    // Force IPv4 (important because Render logs showed IPv6 ENETUNREACH)
    family: 4,

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,

    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendOtpEmail(email, otp) {
  const fromEmail = (
    process.env.FROM_EMAIL || 'scanly.auth.bot@gmail.com'
  )
    .replace(/"/g, '')
    .trim();

  const message = `Your Scanly verification code is: ${otp}

Valid for 10 minutes.
Do not share this code with anyone.`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; color: #fff; border-radius: 12px;">
      <h2 style="margin: 0 0 8px; color: #fff; font-size: 22px;">
        Your verification code
      </h2>

      <p style="color: #aaa; margin: 0 0 24px; font-size: 14px;">
        Enter this code to verify your Scanly account.
      </p>

      <div style="font-size: 40px; font-weight: 700; letter-spacing: 10px; text-align: center; background: #1a1a1a; padding: 20px; border-radius: 8px; color: #00ffa3; margin-bottom: 24px;">
        ${otp}
      </div>

      <p style="color: #666; font-size: 12px; margin: 0;">
        This code expires in
        <strong style="color:#aaa">10 minutes</strong>.
        If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n========================================');
    console.log(`[DEV OTP] To: ${email}`);
    console.log(`[DEV OTP] Code: ${otp}`);
    console.log('========================================\n');

    return {
      success: true,
      dev: true,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Scanly Auth" <${fromEmail}>`,
      to: email,
      subject: `${otp} is your Scanly verification code`,
      text: message,
      html: htmlMessage,
    });

    console.log(
      `[EMAIL] Sent to ${email} — MessageId: ${info.messageId}`
    );

    return { success: true };
  } catch (error) {
    console.error('[EMAIL ERROR]', {
      message: error.message,
      code: error.code,
      command: error.command,
    });

    throw new Error(`Email delivery failed: ${error.message}`);
  }
}