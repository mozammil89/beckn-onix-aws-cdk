import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as helm from 'aws-cdk-lib/aws-eks';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfigProps } from './config';
import * as crypto from 'crypto';


interface HelmBAPStackProps extends StackProps {
    config: ConfigProps;
    eksCluster: eks.Cluster;
}

export class HelmBAPStack extends Stack {
    constructor(scope: Construct, id: string, props: HelmBAPStackProps) {
        super(scope, id, props);
        
        const eksCluster = props.eksCluster;

        const namespace = "bap" + props.config.NAMESPACE;
        // const releaseName = props.config.BAP_RELEASE_NAME;
        const repository = "https://charts.bitnami.com/bitnami";

        const generateRandomPassword = (length: number) => {
            return crypto.randomBytes(length).toString('base64').slice(0, length);
        };
        const rabbitMQPassword = generateRandomPassword(12);

        new helm.HelmChart(this, "RedisHelmChart", {
            cluster: eksCluster,
            chart: "redis",
            namespace: namespace,
            release: "redis",
            wait: true,
            repository: repository,
            values: {
                    auth: {
                        enabled: false
                    },
                    replica: {
                        replicaCount: 0
                    },
                    master: {
                        persistence: {
                            storageClass: "gp2"
                        }
                    }
            }
        });

        new helm.HelmChart(this, "MongoDBHelmChart", {
            cluster: eksCluster,
            chart: "mongodb",
            namespace: namespace,
            release: "mongodb",
            wait: true,
            repository: repository,
            values: {
                    persistence: {
                        storageClass: "gp2"
                    }
            }
        });

        new helm.HelmChart(this, "RabbitMQHelmChart", {
            cluster: eksCluster,
            chart: "rabbitmq",
            namespace: namespace,
            release: "rabbitmq",
            wait: true,
            repository: repository,
            values: {
                    persistence: {
                        enabled: true,
                        storageClass: "gp2"
                    },
                    auth: {
                        username: "beckn",
                        password: rabbitMQPassword
                    }
            }
        });

        new cdk.CfnOutput(this, 'RabbitMQPasswordOutput', {
            value: rabbitMQPassword,
            description: 'Generated password for RabbitMQ'
        });
    }
}