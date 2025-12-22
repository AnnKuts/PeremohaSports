import crypto from 'crypto';
import { authConfig } from '../config/auth.config';
import { mailTransporter, nodemailerConfig } from '../config/mail.config';
import AppError from '../utils/AppError';
import { parseActivationEmailPayload, ActivationEmailPayload } from '../schemas/email.schema';

export const emailService = {
  generateActivationCode(params: { email: string; actor: 'client' | 'trainer'; actorId: number }) {
    const payload: ActivationEmailPayload = {
      email: params.email,
      actor: params.actor,
      actorId: params.actorId,
      expiresAt: Date.now() + authConfig.otp.ttlMs,
      nonce: crypto.randomBytes(8).toString('hex')
    };

    const data = JSON.stringify(payload);

    const signature = crypto
      .createHmac('sha256', authConfig.otp.hmacSecret)
      .update(data)
      .digest('hex');

    const code = Buffer.from(`${data}|${signature}`).toString('base64');

    return {
      code,
      expiresAt: payload.expiresAt
    };
  },

  verifyActivationCode(code: string): ActivationEmailPayload {
    const decoded = Buffer.from(code, 'base64').toString('utf-8');
    const [data, signature] = decoded.split('|');

    if (!data || !signature) {
      throw new AppError('Invalid activation code format', 400);
    }

    const expectedSignature = crypto
      .createHmac('sha256', authConfig.otp.hmacSecret)
      .update(data)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new AppError('Invalid activation code signature', 400);
    }

    return parseActivationEmailPayload(JSON.parse(data));
  },

  async sendActivationEmail(email: string, code: string) {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment) {
      console.log(`Activation code for ${email}: ${code}`);
      return;
    }

    await mailTransporter.sendMail({
      from: nodemailerConfig.from,
      to: email,
      subject: 'Peremoha Sports account activation',
      text: `Your activation code is: ${code}`,
      html: `
        <h2>Account activation</h2>
        <p>Your activation code is:</p>
        <h3>${code}</h3>
        <p>This code will expire in ${authConfig.otp.ttlMs / 60000} minutes.</p>
        <p>Please use this code to activate your account</p>
      `
    });
  }
};
