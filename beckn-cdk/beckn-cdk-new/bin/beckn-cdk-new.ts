#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { ConfigProps, getConfig } from '../lib/config';

import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { EksStack } from '../lib/eks-stack';
import { RedisStack } from '../lib/redis-stack';
import { DocumentDbStack } from '../lib/documentdb-stack';
import { RabbitMqStack } from '../lib/rabbitmq-stack';

import { HelmRegistryStack } from '../lib/helm-registry';
import { HelmGatewayStack } from '../lib/helm-gateway';
import { HelmBAPStack } from '../lib/helm-beckn-bap';

const config = getConfig();
const app = new cdk.App();

type AwsEnvStackProps = StackProps & {
  config: ConfigProps;
};

// Retrieve AWS Account ID and Region from the environment
const accountId = config.ACCOUNT;
const region = config.REGION;

if (!accountId || !region) {
  console.error("AWS_ACCOUNT_ID or AWS_REGION is missing from .env file");
  process.exit(1);
}

// Common environment configuration for all stacks
const env = { account: accountId, region: region };

// Function to deploy registry environment
const deployRegistry = () => {
  const vpcStack = new VpcStack(app, 'RegistryVpcStack', { config: config, env });
  const eksStack = new EksStack(app, 'RegistryEksStack', { config: config, vpc: vpcStack.vpc, env });
  const rdsStack = new RdsStack(app, 'RegistryRdsStack', { config: config, vpc: vpcStack.vpc, env });

  new HelmRegistryStack(app, 'HelmRegistryStack', {
    config: config,
    eksCluster: eksStack.cluster,
    env,
  });
};

// Function to deploy gateway environment
const deployGateway = () => {
  const vpcStack = new VpcStack(app, 'GatewayVpcStack', { config: config, env });
  const eksStack = new EksStack(app, 'GatewayEksStack', { config: config, vpc: vpcStack.vpc, env });
  const rdsStack = new RdsStack(app, 'GatewayRdsStack', { config: config, vpc: vpcStack.vpc, env });

//  new HelmGatewayStack(app, 'HelmGatewayStack', {
//    config: config,
//    eksCluster: eksStack.cluster,
//    //chartName: config.CHART_NAME,
//    externalDomain: config.EXTERNAL_DOMAIN,
//    certArn: config.CERT_ARN,
//    registryUrl: config.REGISTRY_URL,
//    rdsHost: rdsStack.rdsHost,
//  });
  
};

// Function to deploy BAP environment
const deployBAP = () => {
  // const var = "-bap";
  const vpcStack = new VpcStack(app, 'BapVpcStack', { config: config, env });
  const eksStack = new EksStack(app, 'BapEksStack', {config: config, vpc: vpcStack.vpc, env });
  new DocumentDbStack(app, 'BapDocumentDbStack', { vpc: vpcStack.vpc, env });
  new RedisStack(app, 'BapRedisStack', { vpc: vpcStack.vpc, env });
  new RabbitMqStack(app, 'BapRabbitMqStack', { vpc: vpcStack.vpc, env });

  const BapCommonServices = new HelmBAPStack(app, 'HelmBAPStack', {
    config: config,
    eksCluster: eksStack.cluster,
  });

};

// Function to deploy BPP environment
const deployBPP = () => {
  const vpcStack = new VpcStack(app, 'BppVpcStack', {config: config, env });
  new EksStack(app, 'BppEksStack', {config: config, vpc: vpcStack.vpc, env });
  new DocumentDbStack(app, 'BppDocumentDbStack', { vpc: vpcStack.vpc, env });
  new RedisStack(app, 'BppRedisStack', { vpc: vpcStack.vpc, env });
  new RabbitMqStack(app, 'BppRabbitMqStack', { vpc: vpcStack.vpc, env });
};

// Function to deploy sandbox environment (all stacks)
const deploySandbox = () => {
  const vpcStack = new VpcStack(app, 'VpcStack', {config: config, env });
  const eksStack = new EksStack(app, 'EksStack', {config: config, vpc: vpcStack.vpc, env });
  // new RdsStack(app, 'RdsStack', { config: config, vpc: vpcStack.vpc, env });
  
  // new DocumentDbStack(app, 'DocumentDbStack', { vpc: vpcStack.vpc, env });
  // new RedisStack(app, 'RedisStack', { vpc: vpcStack.vpc, env });
  // new RabbitMqStack(app, 'RabbitMqStack', { vpc: vpcStack.vpc, env });
  
  new HelmBAPStack(app, 'HelmBAPStack', {
    config: config,
    eksCluster: eksStack.cluster,
    env,
  });
  new HelmRegistryStack(app, 'HelmRegistryStack', {
    config: config,
    eksCluster: eksStack.cluster,
    env,
  });
};

// Retrieve the environment from CDK context
const environment = app.node.tryGetContext('env');

// Deploy based on the selected environment
switch (environment) {
  case 'sandbox':
    console.log('Deploying sandbox environment...');
    deploySandbox();
    break;
  case 'registry':
    console.log('Deploying registry environment...');
    deployRegistry();
    break;
  case 'gateway':
    console.log('Deploying gateway environment...');
    deployGateway();
    break;
  case 'bap':
    console.log('Deploying BAP environment...');
    deployBAP();
    break;
  case 'bpp':
    console.log('Deploying BPP environment...');
    deployBPP();
    break;
  default:
    console.error('Unknown environment specified.');
    process.exit(1);
}
