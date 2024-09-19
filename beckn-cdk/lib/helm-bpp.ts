import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as helm from 'aws-cdk-lib/aws-eks';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfigProps } from './config';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';

interface HelmBppStackProps extends StackProps {
  config: ConfigProps;
  vpc: ec2.Vpc;
  isSandbox: boolean;
  eksCluster: eks.Cluster;
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

    const bppPrivateKey = props.config.BPP_PRIVATE_KEY;
    const bppPublicKey = props.config.BPP_PUBLIC_KEY;

    const isSandbox = props.isSandbox;

    const efsBppFileSystemId = new efs.FileSystem(this, 'Beckn-Onix-Bpp', {
      vpc: props.vpc,
    });

    new helm.HelmChart(this, 'Bpphelm', {
      cluster: eksCluster,
      chart: 'beckn-onix-bap',
      release: releaseName,
      wait: false,
      repository: repository,
      values: {
        global: {
          isSandbox: isSandbox,
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
        value: efsBppFileSystemId.fileSystemId,
    });
  }
}
