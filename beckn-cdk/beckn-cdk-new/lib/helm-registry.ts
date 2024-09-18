import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as helm from 'aws-cdk-lib/aws-eks';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfigProps } from './config';

  interface HelmRegistryStackProps extends StackProps {
    config: ConfigProps;
    eksCluster: eks.Cluster;
}

export class HelmRegistryStack extends Stack {
  constructor(scope: Construct, id: string, props: HelmRegistryStackProps) {
    super(scope, id, props);

    const eksCluster = props.eksCluster;
    // const chartName = props.chartName;
    const externalDomain = props.config.EXTERNAL_DOMAIN;
    const certArn = props.config.CERT_ARN;
    const namespace = props.config.NAMESPACE;
    const releaseName = props.config.REGISTRY_RELEASE_NAME;
    const repository = props.config.REPOSITORY;

    const rdsHost = props.config.RDS_HOST;
    const rdsPassword = props.config.RDS_PASSWORD;

    new helm.HelmChart(this, "registryhelm", {
        cluster: eksCluster,
        chart: "beckn-onix-registry",
        // namespace: namespace, # Not required for registry or other Beckn-ONIX chart. Pls remove it.
        release: releaseName,
        wait: true,
        repository: repository,
        values: {
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

    });
  }
}
