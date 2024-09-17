#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { VpcAlbStack } from '../lib/vpc-alb-stack';
import { RdsStack } from '../lib/rds-stack';
import { EksStack } from '../lib/eks-stack';
import { RedisStack } from '../lib/redis-stack';
import { DocumentDbStack } from '../lib/documentdb-stack';
import { RabbitMqStack } from '../lib/rabbitmq-stack';

import { HelmRegistryStack } from '../lib/helm-registry';
import { HelmGatewayStack } from '../lib/helm-gateway';
import { HelmBAPStack } from '../lib/helm-beckn-bap';

// import * as dotenv from 'dotenv';  // Import dotenv to load .env variables

// Load environment variables from .env
// dotenv.config();

import { ConfigProps, getConfig } from '../lib/config';

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
  const vpcAlbStack = new VpcAlbStack(app, 'RegistryVpcAlbStack', { env });
  const eksStack = new EksStack(app, 'RegistryEksStack', { vpc: vpcAlbStack.vpc, env });
  const rdsStack = new RdsStack(app, 'RegistryRdsStack', { config: config, vpc: vpcAlbStack.vpc, env });

  new HelmRegistryStack(app, 'HelmRegistryStack', {
    externalDomain: config.EXTERNAL_DOMAIN,
    certArn: config.CERT_ARN,
    chartName: config.CHART_NAME,
    config: config,
    eksCluster: eksStack.cluster,
    rdsHost: rdsStack.rdsHost,
  });
};

// Function to deploy gateway environment
const deployGateway = () => {
  const vpcAlbStack = new VpcAlbStack(app, 'GatewayVpcAlbStack', { env });
  const eksStack = new EksStack(app, 'GatewayEksStack', { vpc: vpcAlbStack.vpc, env });
  const rdsStack = new RdsStack(app, 'GatewayRdsStack', { config: config, vpc: vpcAlbStack.vpc, env });

  new HelmGatewayStack(app, 'HelmGatewayStack', {
    config: config,
    eksCluster: eksStack.cluster,
    chartName: config.CHART_NAME,
    externalDomain: config.EXTERNAL_DOMAIN,
    certArn: config.CERT_ARN,
    registryUrl: config.REGISTRY_URL,
    rdsHost: rdsStack.rdsHost,
  });
};

// Function to deploy BAP environment
const deployBAP = () => {
  const vpcAlbStack = new VpcAlbStack(app, 'BapVpcAlbStack', { env });
  const eksStack = new EksStack(app, 'BapEksStack', { vpc: vpcAlbStack.vpc, env });
  new DocumentDbStack(app, 'BapDocumentDbStack', { vpc: vpcAlbStack.vpc, env });
  new RedisStack(app, 'BapRedisStack', { vpc: vpcAlbStack.vpc, env });
  new RabbitMqStack(app, 'BapRabbitMqStack', { vpc: vpcAlbStack.vpc, env });

  new HelmBAPStack(app, 'HelmBAPStack', {
    config: config,
    eksCluster: eksStack.cluster,
  });

};

// Function to deploy BPP environment
const deployBPP = () => {
  const vpcAlbStack = new VpcAlbStack(app, 'BppVpcAlbStack', { env });
  new EksStack(app, 'BppEksStack', { vpc: vpcAlbStack.vpc, env });
  new DocumentDbStack(app, 'BppDocumentDbStack', { vpc: vpcAlbStack.vpc, env });
  new RedisStack(app, 'BppRedisStack', { vpc: vpcAlbStack.vpc, env });
  new RabbitMqStack(app, 'BppRabbitMqStack', { vpc: vpcAlbStack.vpc, env });
};

// Function to deploy sandbox environment (all stacks)
const deploySandbox = () => {
  const vpcAlbStack = new VpcAlbStack(app, 'VpcAlbStack', { env });
  new EksStack(app, 'EksStack', { vpc: vpcAlbStack.vpc, env });
  new RdsStack(app, 'RdsStack', { config: config, vpc: vpcAlbStack.vpc, env });
  new DocumentDbStack(app, 'DocumentDbStack', { vpc: vpcAlbStack.vpc, env });
  new RedisStack(app, 'RedisStack', { vpc: vpcAlbStack.vpc, env });
  new RabbitMqStack(app, 'RabbitMqStack', { vpc: vpcAlbStack.vpc, env });
};

// Retrieve the environment from CDK context
const environment = app.node.tryGetContext('env') || 'sandbox';

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
