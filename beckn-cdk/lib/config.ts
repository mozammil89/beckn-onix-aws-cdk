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
    RDS_USER: string,
    RDS_PASSWORD: string,
    EXTERNAL_DOMAIN: string,
    CERT_ARN: string,
    CHART_NAME: string,
    REGISTRY_URL: string,
    MAX_AZS: number,
    EKS_CLUSTER_NAME: string,
    CIDR: string,
    EC2_NODES_COUNT: number;
    EC2_INSTANCE_TYPE: string;
    ROLE_ARN: string;
};

export const getConfig = (): ConfigProps => ({
    REGION: process.env.REGION || "ap-south-1",
    ACCOUNT: process.env.ACCOUNT || "",
    REPOSITORY: "",
    MAX_AZS: Number(process.env.MAZ_AZs) || 2,
    NAMESPACE: "beckn-onix-name-space",
    REGISTRY_RELEASE_NAME: "rls-name-registry",
    GATEWAY_RELEASE_NAME: "rls-name-gateway",
    BAP_RELEASE_NAME: "rls-name-bap",
    BPP_RELEASE_NAME: "rls-name-bpp",
    RDS_USER: process.env.RDS_USER || "",
    RDS_PASSWORD: "dummy_password",
    EXTERNAL_DOMAIN: "", // user must provide it
    CERT_ARN: "", // user must provide it
    CHART_NAME: "", // chart name
    REGISTRY_URL: "", // bitnami specification
    EKS_CLUSTER_NAME: process.env.EKS_CLUSTER_NAME || "beckn-onix",
    CIDR: process.env.CIDR || "10.0.0.0/16",
    EC2_NODES_COUNT: Number(process.env.EC2_NODES_COUNT) || 2,
    EC2_INSTANCE_TYPE: process.env.EC2_INSTANCE_TYPE || "t3.medium",
    ROLE_ARN: process.env.ROLE_ARN || "",
});