import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class VpcAlbStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly alb: elb.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC
    this.vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 3,  // Maximum number of availability zones
      natGateways: 1,  // Single NAT Gateway in the public subnet
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'AppLayer',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,  // Use the newer "PRIVATE_WITH_EGRESS" instead of PRIVATE_WITH_NAT
        },
        {
          cidrMask: 24,
          name: 'DatabaseLayer',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ]
    });

    // Security group for the ALB
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ALB',
      allowAllOutbound: true,
    });

    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    // Create Application Load Balancer (ALB)
    this.alb = new elb.ApplicationLoadBalancer(this, 'MyALB', {
      vpc: this.vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // ALB Listener
    const listener = this.alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [],
      healthCheck: {
        path: '/',
        interval: cdk.Duration.minutes(1),
      },
    });

    // Outputs

    // Output the ALB DNS name so it can be referenced in other stacks
    new cdk.CfnOutput(this, 'ALBDNSName', {
      value: this.alb.loadBalancerDnsName,
      exportName: 'ALBDNSName',  // Export ALB DNS name to be used in other stacks
    });

    // Output the VPC CIDR block for other stacks to reference
    new cdk.CfnOutput(this, 'VpcCidrBlock', {
      value: this.vpc.vpcCidrBlock,
      exportName: 'VpcCidrBlock-env',  // Export name to reference in other stacks
    });

    // Output the VPC ID for other stacks
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: 'VpcId',  // Export name to reference in other stacks
    });

    // Output the Public Subnet IDs
    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: this.vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
      exportName: 'PublicSubnetIds',  // Export name to reference in other stacks
    });

    // Output the App Layer Subnet IDs (for application instances or services)
    new cdk.CfnOutput(this, 'AppLayerSubnetIds', {
      value: this.vpc.selectSubnets({ subnetGroupName: 'AppLayer' }).subnetIds.join(','),
      exportName: 'AppLayerSubnetIds',  // Export name to reference in other stacks
    });

    // Output the Database Layer Subnet IDs (for database instances)
    new cdk.CfnOutput(this, 'DatabaseSubnetIds', {
      value: this.vpc.selectSubnets({ subnetGroupName: 'DatabaseLayer' }).subnetIds.join(','),
      exportName: 'DatabaseSubnetIds',  // Export name to reference in other stacks
    });
  }
}


