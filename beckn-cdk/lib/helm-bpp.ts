import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as helm from 'aws-cdk-lib/aws-eks';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfigProps } from './config';

interface HelmBppStackProps extends StackProps {
  config: ConfigProps;
  eksCluster: eks.Cluster;
  bppPrivateKey: string;
  bppPublicKey: string;
  efsBppFileSystemId: string;
}

export class HelmBppStack extends Stack {
  constructor(scope: Construct, id: string, props: HelmBppStackProps) {
    super(scope, id, props);

    const eksCluster = props.eksCluster;
    const externalDomain = props.config.EXTERNAL_DOMAIN;
    const certArn = props.config.CERT_ARN;
    const releaseName = props.config.BPP_RELEASE_NAME;
    const repository = props.config.REPOSITORY;
    const registryUrl = props.config.REGISTRY_URL;
    const bppPrivateKey = props.bppPrivateKey;
    const bppPublicKey = props.bppPublicKey;
    const efsBppFileSystemId = props.efsBppFileSystemId

    const efsBapFileSystemId = new efs.FileSystem(this, 'Beckn-Onix-Bap', {
      vpc: vpc,
    });

    new helm.HelmChart(this, 'Bpphelm', {
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
            privateKey: bppPrivateKey,
            publicKey: bppPublicKey,
          },
          efs: {
            fileSystemId: efsBppFileSystemId.fileSystemId,
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
