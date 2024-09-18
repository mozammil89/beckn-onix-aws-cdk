import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as helm from 'aws-cdk-lib/aws-eks';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfigProps } from './config';

interface HelmRegistryStackProps extends cdk.StackProps {
    config: ConfigProps;
    eksCluster: eks.Cluster;
    chartName: string;
    externalDomain: string;
    certArn: string;
    rdsHost: string;
  }

export class HelmRegistryStack extends Stack {
  constructor(scope: Construct, id: string, props: HelmRegistryStackProps) {
    super(scope, id, props);

    const eksCluster = props.eksCluster;
    const chartName = props.chartName;
    const externalDomain = props.externalDomain;
    const certArn = props.certArn;
    const namespace = props.config.NAMESPACE;
    const releaseName = props.config.REGISTRY_RELEASE_NAME;
    const repository = props.config.REPOSITORY;

    const rdsHost = props.rdsHost;
    const rdsPassword = props.config.RDS_PASSWORD;

    new helm.HelmChart(this, "registryhelm", {
        cluster: eksCluster,
        chart: chartName,
        namespace: namespace,
        release: releaseName,
        wait: true,
        repository: repository,
        values: {
            global: {
                externalDomain: externalDomain,
                database: {
                    host: rdsHost,
                    password: rdsPassword
                },
                ingress: {
                    tls: 
                    {
                        certificateArn: certArn,
                    },
                },
            }
        }

    });
  }
}
