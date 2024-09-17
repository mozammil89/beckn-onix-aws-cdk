## Prerequisites:

Configuring AWS CLI is a crucial step in working with AWS CDK. You can do it in your local environment.If you prefer to configure AWS CLI on a remote server, you can SSH-ing into the server and running aws configure to set up the CLI credentials and configuration. Just ensure that the server has network connectivity to AWS services and that you have the necessary permissions to configure AWS CLI and access AWS resources from that server.
One way of installing the AWS CDK CLI is by using the node package manager. You can install it globally by using the following command:

`npm install -g aws-cdk`

## AWS CDK Stack Overview

The CDK comprises stacks designed to perform unique provisioning steps, making the overall automation modular. Here is an overview of all the stacks along with the actions they perform:

| CDK Stack Name |        File Name/Path                   | Description |
| -------------- |        --------------                   | ----------- |
| vpcalbstack    |  Filler for the actual file name        | This stack creates the VPC in which your resources will be deployed, along with one public subnet and 2 private subnets. |     
| rdsstack       | Filler for the actual file name         | This stack creates a PostgreSQL Aurora database cluster
| eksstack       | Filler for the actual file name         | To create EKS EC2 Cluster
| redisstack     | Filler for the atual file name          | This stack will create a redis cluster
| documentdbstack| Filler for the actual file name         | This stack will create a documentDB cluster
| rabbitmqstack  | Filler for the actual file name         | This stack will create a rabbitmq broker


## Preparing your Environment

1. Install Typescript globally for CDK. The code for that is:
   
   ` npm i -g typescript `

2. Install the AWS CDK:

   `npm i -g aws-cdk`

3. Clone this repository:

   `git clone <repo_url>`
   `cd folder-name`

4. Install the CDK application

   ` npm i`

5. Bootstrap your CDK environment

   `cdk bootstrap aws://<ACCOUNT-NUMBER>/<REGION>`

In your folder, open the .env file using your preferred code editor. There are some mandatory environment variables that you will have to update here. The environment variables and example values along with a description are provided below:

| Environment Variables |   Example value | Description |
| --------------------- | --------------  | ----------  |
| REGION                | ap-south-1      | The AWS region in which to deploy all the resources |
| ACCOUNT               | 123456789123    | Your AWS 12 digit account number |



## Deploy CDK

After you have made the relevant updates to the .env file, run the following commands to begin the deployment process

Emits the synthesized Cloudformation template

`cdk synth`

Lists all the cdk stacks

`cdk list`

You can now choose to deploy one of the following environments: Sandbox, Registry, Gateway, BAP or BPP
1. The Sandbox environment will deploy all the stacks including VPC, EKS, RDS and the microservices like Redis, DocumentDB and RabbitMQ.

   `cdk deploy --context env=sandbox`

2. The Registry environment will deploy the following stacks: VPC, EKS and RDS

   `cdk deploy --context env=registry`

3. The Gateway environment will deploy the following stacks: VPC, EKS and RDS.

   `cdk deploy --context env=gateway`

4. The BAP enviroment will deploy the following stacks: VPC, EKS, Redis, DocumentDB and RabbitMQ

   `cdk deploy --context env=bap`

5. The BPP enviroment will deploy the following stacks: VPC, EKS, Redis, DocumentDB and RabbitMQ

   `cdk deploy --context env=bpp`

After installing all the CDK stacks, verify the AWS services in the AWS web console. 
The stack 'helmstack-name' installs the helm chart for the corresponding environment - registry, gateway, bap or BPP , vault helm chart and vault init helm chart to initialize and unseal the vault in the EKS cluster. It is recommended to review the Deployment through Helm guide to become familiar with Helm charts, services, and parameters. This will be beneficial if you opt to run the Helm chart separately from the CDK, following the "Mode Two: Direct Helm Chart Invocation" approach for installing the Sunbird RC stack.



















