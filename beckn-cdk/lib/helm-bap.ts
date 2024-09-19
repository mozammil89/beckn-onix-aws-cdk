import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as helm from 'aws-cdk-lib/aws-eks';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfigProps } from './config';
import * as efs from 'aws-cdk-lib/aws-efs';

interface HelmBapStackProps extends StackProps {
  config: ConfigProps;
  eksCluster: eks.Cluster;
  bapPrivateKey: string;
  bapPublicKey: string;
  efsBapFileSystemId: string;
}

export class HelmBapStack extends Stack {
  constructor(scope: Construct, id: string, props: HelmBapStackProps) {
    super(scope, id, props);

    const eksCluster = props.eksCluster;
    const externalDomain = props.config.EXTERNAL_DOMAIN;
    const certArn = props.config.CERT_ARN;
    const releaseName = props.config.BAP_RELEASE_NAME;
    const repository = props.config.REPOSITORY;
    const registryUrl = props.config.REGISTRY_URL;
    const bapPrivateKey = props.bapPrivateKey;
    const bapPublicKey = props.bapPublicKey;

    const efsBapFileSystemId = new efs.FileSystem(this, 'Beckn-Onix-Bap', {
      vpc: props.,
    });
    
    new helm.HelmChart(this, 'baphelm', {
      cluster: eksCluster,
      chart: 'beckn-onix-bap',
      release: releaseName,
      wait: false,
      repository: repository,
      values: {
        global: {
          externalDomain: externalDomain,
          registry_url: registryUrl,
          bap: {
            privateKey: bapPrivateKey,
            publicKey: bapPublicKey,
          },
          efs: {
            fileSystemId: efsBapFileSystemId.fileSystemId,
          },
        },
        ingress: {
          tls: {
            certificateArn: certArn,
          },
        },
      },
    });
    new cdk.CfnOutput(this, String("EksFileSystemId"), {
      value: efsBapFileSystemId.fileSystemId,
  });
  }
}
