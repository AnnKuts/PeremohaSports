export const awsConfig = {
  region: process.env.AWS_REGION as string,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  sesFromEmail: process.env.SES_FROM_EMAIL as string,
};

if (!awsConfig.region) {
  throw new Error("AWS_REGION is not defined");
}

if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
  throw new Error("AWS credentials are not defined");
}

if (!awsConfig.sesFromEmail) {
  throw new Error("SES_FROM_EMAIL is not defined");
}
