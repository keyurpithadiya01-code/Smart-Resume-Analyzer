import bcrypt from 'bcryptjs';
import OtpSession from '../models/OtpSession.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAndStoreOtp(email) {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpSession.deleteMany({ email, purpose: 'signup' });
  await OtpSession.create({ email, otpHash, expiresAt, purpose: 'signup' });

  return otp;
}

export async function verifyOtp(email, otp) {
  const session = await OtpSession.findOne({ email, purpose: 'signup' }).sort({ createdAt: -1 });
  if (!session) return { ok: false, error: 'OTP expired or not found. Request a new one.' };
  if (session.expiresAt < new Date()) {
    await OtpSession.deleteOne({ _id: session._id });
    return { ok: false, error: 'OTP has expired. Request a new one.' };
  }
  if (session.attempts >= MAX_ATTEMPTS) {
    await OtpSession.deleteOne({ _id: session._id });
    return { ok: false, error: 'Too many failed attempts. Request a new OTP.' };
  }

  const match = await bcrypt.compare(String(otp), session.otpHash);
  if (!match) {
    session.attempts += 1;
    await session.save();
    return { ok: false, error: 'Invalid OTP' };
  }

  await OtpSession.deleteOne({ _id: session._id });
  return { ok: true };
}
