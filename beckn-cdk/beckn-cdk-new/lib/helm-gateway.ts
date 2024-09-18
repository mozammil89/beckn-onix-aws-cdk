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
    registryUrl: string;
    certArn: string;
    rdsHost: string;
  }

export class HelmGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: HelmRegistryStackProps) {
    super(scope, id, props);

    const eksCluster = props.eksCluster;
    const chartName = props.chartName;
    const externalDomain = props.externalDomain;
    const certArn = props.certArn;
    const registryUrl = props.registryUrl;

    const namespace = props.config.NAMESPACE; // add namespace to the config file
    const releaseName = props.config.GATEWAY_RELEASE_NAME; // add release name to the config file
    const repository = props.config.REPOSITORY;

    const rdsHost = props.rdsHost;
    const rdsPassword = props.config.RDS_PASSWORD;

    new helm.HelmChart(this, "gatewayhelm", {
        cluster: eksCluster,
        chart: chartName,
        namespace: namespace,
        release: releaseName,
        wait: true,
        repository: repository,
        values: {
            global: {
                externalDomain: externalDomain,
                registry_url: registryUrl,
                database: {
                    host: rdsHost,
                    password: rdsPassword,
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
