import { registerAs } from "@nestjs/config";

export default registerAs("s3", () => {
    const {
        S3_BUCKET,
        S3_ENDPOINT,
        S3_KEY_ID,
        S3_PUBLIC_DOMAIN,
        S3_REGION,
        S3_SECRET_ACCESS_KEY,
        S3_TENANT_ID,
    } = process.env;

    return {
        endpoint: S3_ENDPOINT ?? "https://s3.cloud.ru",
        region: S3_REGION ?? "ru-central-1",
        bucket: S3_BUCKET ?? "gracheveloper-bucket",
        publicDomain: S3_PUBLIC_DOMAIN,
        credentials: {
            accessKeyId: `${S3_TENANT_ID}:${S3_KEY_ID}`,
            secretAccessKey: S3_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true,
    };
});
