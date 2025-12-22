import nodemailer from 'nodemailer';

export const nodemailerConfig = {
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  user: process.env.SMTP_USER as string,
  pass: process.env.SMTP_PASS as string,
  from: process.env.MAIL_FROM as string
};

if (!nodemailerConfig.host) {
  throw new Error('SMTP_HOST is not defined');
}

if (!nodemailerConfig.port) {
  throw new Error('SMTP_PORT is not defined');
}

if (!nodemailerConfig.user || !nodemailerConfig.pass) {
  throw new Error('SMTP credentials are not defined');
}

if (!nodemailerConfig.from) {
  throw new Error('MAIL_FROM is not defined');
}

export const mailTransporter = nodemailer.createTransport({
  host: nodemailerConfig.host,
  port: nodemailerConfig.port,
  secure: nodemailerConfig.port === 465,
  auth: {
    user: nodemailerConfig.user,
    pass: nodemailerConfig.pass
  }
});

mailTransporter
  .verify()
  .then(() => console.log('smtp works'))
  .catch((err) => console.error('smtp fails:', err));
