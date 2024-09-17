import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

interface EksStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class EksStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);

    // Create Amazon EKS Cluster
    const eksCluster = new eks.Cluster(this, 'EKSCluster', {
      vpc: props.vpc,
      version: eks.KubernetesVersion.V1_24,
      defaultCapacity: 0,
    });

    // Create a role for EC2 instances in EKS
    const eksNodeRole = new iam.Role(this, 'EKSNodeRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
      ],
    });

    // Create an Auto Scaling Group for EKS worker nodes
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'EKSASG', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
      machineImage: new eks.EksOptimizedImage({
        kubernetesVersion: '1.24',
      }),
      desiredCapacity: 3,
      minCapacity: 3,
      maxCapacity: 5,
      role: eksNodeRole,
    });

    eksCluster.connectAutoScalingGroupCapacity(autoScalingGroup, {
      mapRole: true,
    });

    // Add the Amazon EBS CSI Driver add-on to the EKS cluster
    new eks.CfnAddon(this, 'EbsCsiAddon', {
      addonName: 'aws-ebs-csi-driver',
      clusterName: eksCluster.clusterName,
      resolveConflicts: 'OVERWRITE',  // Optional: overwrite if already installed
    });

    this.cluster = eksCluster;
  }
}

