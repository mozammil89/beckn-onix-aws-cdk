import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { KubectlV30Layer } from '@aws-cdk/lambda-layer-kubectl-v30';
import { Construct } from 'constructs';
import { ConfigProps } from './config';

export interface EksStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class EksStack extends cdk.Stack {
  public readonly clusterAdminGroup: iam.Group;
  public readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    // Create the EKS cluster admin role
    const clusterAdminRole = new iam.Role(this, 'ClusterAdminRole', {
      assumedBy: new iam.AccountRootPrincipal(), // The account's root user
    });

    // Create the EKS cluster
    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      mastersRole: clusterAdminRole, // Assign the admin role to the cluster
      version: eks.KubernetesVersion.V1_30,
      kubectlLayer: new KubectlV30Layer(this, 'KubectlLayer'), // kubectl layer for cluster interactions
      authenticationMode: eks.AuthenticationMode.API_AND_CONFIG_MAP,
    });

    cluster.grantAccess('clusterAdminAccess', clusterAdminRole.roleArn, [
      eks.AccessPolicy.fromAccessPolicyName('AmazonEKSClusterAdminPolicy', {
        accessScopeType: eks.AccessScopeType.CLUSTER,
      }),
    ]);

    this.clusterAdminGroup = new iam.Group(this, 'EKSClusterAdminGroup');
    this.cluster = cluster;
    // Map the IAM role to Kubernetes system:masters for full cluster access
    // cluster.awsAuth.addMastersRole(clusterAdminRole);

    // // Example of mapping another IAM role to cluster
    // const exampleUserRole = new iam.Role(this, 'ExampleUserRole', {
    //   assumedBy: new iam.AccountPrincipal(''),
    // });

    // cluster.awsAuth.addRoleMapping(exampleUserRole, {
    //   groups: ['system:masters'], // Full admin access
    //   username: 'example-user',   // Username for the role in Kubernetes
    // });
  }
}