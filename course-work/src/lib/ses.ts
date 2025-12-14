import { SESClient } from "@aws-sdk/client-ses";
import { awsConfig } from "../config/aws.config";

export const sesClient = new SESClient({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
});
