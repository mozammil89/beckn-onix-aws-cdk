import * as dotenv from "dotenv";
import path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export type ConfigProps = {
    REGION: string,
    ACCOUNT: string,
    // CIDR
    // MAX_AZS
    REPOSITORY: string,
    NAMESPACE: string,
    REGISTRY_RELEASE_NAME: string;
    GATEWAY_RELEASE_NAME: string;
    BAP_RELEASE_NAME: string;
    BPP_RELEASE_NAME: string,
    RDS_PASSWORD: string,
    EXTERNAL_DOMAIN: string,
    CERT_ARN: string,
    CHART_NAME: string,
    REGISTRY_URL: string
};

export const getConfig = (): ConfigProps => ({
    REGION: process.env.AWS_REGION || "ap-south-1",
    ACCOUNT: process.env.AWS_ACCOUNT_ID || "",
    REPOSITORY: "",
    NAMESPACE: "beckn-onix-name-space",
    REGISTRY_RELEASE_NAME: "rls-name-registry",
    GATEWAY_RELEASE_NAME: "rls-name-gateway",
    BAP_RELEASE_NAME: "rls-name-bap",
    BPP_RELEASE_NAME: "rls-name-bpp",
    RDS_PASSWORD: "dummy_password",
    EXTERNAL_DOMAIN: "", // user must provide it
    CERT_ARN: "", // user must provide it
    CHART_NAME: "", // chart name
    REGISTRY_URL: "", // bitnami specification
});