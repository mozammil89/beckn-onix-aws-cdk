import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { KubectlV30Layer } from '@aws-cdk/lambda-layer-kubectl-v30';
// import { CfnAutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';
import { ConfigProps } from './config';

export interface EksStackProps extends cdk.StackProps {
  config: ConfigProps;
  vpc: ec2.Vpc;
}

export class EksStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;
  

  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);

    const config = props.config;
    

    const vpc = props.vpc;
    const cidr = config.CIDR; // from config file
    const EKS_CLUSTER_NAME = config.EKS_CLUSTER_NAME; // take it from config file
    // const ROLE_ARN = 'ROLE_ARN'; // take form config file
    const ROLE_ARN = config.ROLE_ARN;

    const securityGroupEKS = new ec2.SecurityGroup(this, "EKSSecurityGroup", {
        vpc: vpc,
        allowAllOutbound: true,
        description: "Security group for EKS",
    });

    securityGroupEKS.addIngressRule(
        ec2.Peer.ipv4(cidr),
        ec2.Port.allTraffic(),
        "Allow EKS traffic"
    );


    // const clusterAdminRole = new iam.Role(this, 'ClusterAdminRole', {
    //   assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
    // });

    // const clusterAdminRole = new iam.Role(this, 'ClusterAdminRole', {
    //   assumedBy: new iam.AccountRootPrincipal(),
    // });

    const iamRole = iam.Role.fromRoleArn(this, "MyIAMRole", ROLE_ARN);

    // Create the EKS cluster
    this.cluster = new eks.Cluster(this, 'EksCluster', {
        vpc: vpc,
        vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
        defaultCapacity: config.EC2_NODES_COUNT,
        defaultCapacityInstance: new ec2.InstanceType(config.EC2_INSTANCE_TYPE),
        kubectlLayer: new KubectlV30Layer(this, 'KubectlLayer'),
        version: eks.KubernetesVersion.V1_30,
        securityGroup: securityGroupEKS,
        endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
        ipFamily: eks.IpFamily.IP_V4,
        clusterName: EKS_CLUSTER_NAME,
        mastersRole: iamRole, // Assign the admin role to the cluster
        outputClusterName: true,
        outputConfigCommand: true,
        authenticationMode: eks.AuthenticationMode.API_AND_CONFIG_MAP,
        bootstrapClusterCreatorAdminPermissions: true,
        
        albController: {
          version: eks.AlbControllerVersion.V2_8_1,
          repository: "public.ecr.aws/eks/aws-load-balancer-controller",
        },
    });

    // const clusterAdminGroup = new iam.Group(this, 'ClusterAdminGroup');

    // this.cluster.grantAccess('clusterAdminAccess', clusterAdminGroup.roleArn, [
    //   eks.AccessPolicy.fromAccessPolicyName('AmazonEKSClusterAdminPolicy', {
    //     accessScopeType: eks.AccessScopeType.CLUSTER,
    //   }),
    // ]);

    // const eksUser = new iam.User(this, 'EksUser');
    // this.cluster.awsAuth.addUserMapping(eksUser, {
    //   groups: ['system:masters'],
    //   username: eksUser.userName,
    // });

    const key1 = this.cluster.openIdConnectProvider.openIdConnectProviderIssuer;
    const stringEquals = new cdk.CfnJson(this, 'ConditionJson', {
      value: { 
        [`${key1}:sub`]: ['system:serviceaccount:kube-system:ebs-csi-controller-sa', 'system:serviceaccount:kube-system:efs-csi-controller-sa'],
        [`${key1}:aud`]: 'sts.amazonaws.com' 
      },
    })

    const oidcEKSCSIRole = new iam.Role(this, "OIDCRole", {
        assumedBy: new iam.FederatedPrincipal(
            `arn:aws:iam::${this.account}:oidc-provider/${this.cluster.clusterOpenIdConnectIssuer}`,
            {
                StringEquals: stringEquals,

            },
            "sts:AssumeRoleWithWebIdentity"
        ),
    });

    // Attach a managed policy to the role
    oidcEKSCSIRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonEBSCSIDriverPolicy"))
    oidcEKSCSIRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonEFSCSIDriverPolicy"))

    const ebscsi = new eks.CfnAddon(this, "addonEbsCsi",
        {
            addonName: "aws-ebs-csi-driver",
            clusterName: this.cluster.clusterName,
            serviceAccountRoleArn: oidcEKSCSIRole.roleArn
        }
    );

    const efscsi = new eks.CfnAddon(this, "addonEfsCsi",
        {
            addonName: "aws-efs-csi-driver",
            clusterName: this.cluster.clusterName,
            serviceAccountRoleArn: oidcEKSCSIRole.roleArn
        }
    );


    // const accessPolicy = eks.AccessPolicy.fromAccessPolicyName('AmazonEKSClusterAdminPolicy', {
    //   accessScopeType: eks.AccessScopeType.CLUSTER,
    // })

    // const clusterAdminRole = new iam.Role(this, 'ClusterAdminRole', {
    //       assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
    // });

    // const clusterAdminGroup = new iam.Group(this, 'EKSClusterAdminGroup');

    // const eksAdminPolicy = new iam.Policy(this, 'EKSAdminPolicy', {
    //   statements: [
    //     new iam.PolicyStatement({
    //       actions: [
    //         'eks:DescribeCluster',
    //         'eks:CreateCluster',
    //         'eks:DeleteCluster',
    //         'eks:UpdateClusterConfig',
    //       ],
    //       resources: [this.cluster.clusterArn],
    //     }),
    //   ],
    // });

    // // Attach the policy to the group
    // clusterAdminGroup.attachInlinePolicy(eksAdminPolicy);



    // clusterAdminGroup.addToRole(clusterAdminRole);
    // clusterAdminGroup.add

    

    // const accessEntry = new eks.AccessEntry(this, 'MyAccessEntry', {
    //   accessPolicies: [accessPolicy],
    //   cluster: this.cluster,
    //   principal: clusterAdminRole.roleArn,

    //   // the properties below are optional
    //   accessEntryName: 'accessEntryName',
    //   accessEntryType: eks.AccessEntryType.STANDARD,
    // });

    // this.cluster.grantAccess('clusterAdminAccess', clusterAdminRole.roleArn, [
    //   eks.AccessPolicy.fromAccessPolicyName('AmazonEKSClusterAdminPolicy', {
    //     accessScopeType: eks.AccessScopeType.CLUSTER,
    //   }),
    // ]);

    new cdk.CfnOutput(this, String("OIDC-issuer"), {
        value: this.cluster.clusterOpenIdConnectIssuer,
    });

    new cdk.CfnOutput(this, String("OIDC-issuerURL"), {
        value: this.cluster.clusterOpenIdConnectIssuerUrl,
    });

    new cdk.CfnOutput(this, "EKS Cluster Name", {
        value: this.cluster.clusterName,
    });
    new cdk.CfnOutput(this, "EKS Cluster Arn", {
        value: this.cluster.clusterArn,
    });
  }
}