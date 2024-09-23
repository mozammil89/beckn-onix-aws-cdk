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
   `cd beckn-cdk`

4. Install the CDK application

   ` npm i`

5. Bootstrap your CDK environment

   `cdk bootstrap aws://<ACCOUNT-NUMBER>/<REGION>`

In your folder, open the .env file using your preferred code editor. There are some mandatory environment variables that you will have to update here. The environment variables and example values along with a description are provided below:

#### AWS SPECIFIC MANDATORY VARIABLES ####

| Environment Variables |   Example value | Description |
| --------------------- | --------------  | ----------  |
| REGION                | ap-south-1      | The AWS region in which to deploy all the resources |
| ACCOUNT               | 123456789123    | Your AWS 12 digit account number |

Beckn-ONIX specific environment variables:

#### BECKN-ONIX SPECIFIC MANDATORY VARIABLES ####

**Note:** Depending on the Beckn-ONIX component you wish to install, please update the `.env` file with the respective environment variables.

---

### Registry

| Variable                      | Description                                            | Example Value                                                |
|-------------------------------|--------------------------------------------------------|-------------------------------------------------------------|
| `REGISTRY_URL`               | External domain for the registry                       | `registry-cdk.beckn-onix-aws-cdk.becknprotocol.io`        |

### Gateway

| Variable                      | Description                                            | Example Value                                                |
|-------------------------------|--------------------------------------------------------|-------------------------------------------------------------|
| `GATEWAY_EXTERNAL_DOMAIN`     | External domain for the gateway                        | `gateway-cdk.beckn-onix-aws-cdk.becknprotocol.io`         |

### BAP (Buyer Application Provider)

| Variable                      | Description                                            | Example Value                                                |
|-------------------------------|--------------------------------------------------------|-------------------------------------------------------------|
| `BAP_EXTERNAL_DOMAIN`         | External domain for the BAP                           | `bap-cdk.beckn-onix-aws-cdk.becknprotocol.io`             |
| `BAP_PRIVATE_KEY`             | Private key for the BAP                               | `pivurna3jQBmZGZeeOssgvD0NqMUuWedGjnM9U+hf8i5GXy3eoHVP7ZNs0CL+m7WB/Lq7L2/NvdPdiJWt9kjOQ==` |
| `BAP_PUBLIC_KEY`              | Public key for the BAP                               | `uRl8t3qB1T+2TbNAi/pu1gfy6uy9vzb3T3YiVrfZIzk=`          |

### BPP (Buyer Platform Provider)

| Variable                      | Description                                            | Example Value                                                |
|-------------------------------|--------------------------------------------------------|-------------------------------------------------------------|
| `BPP_EXTERNAL_DOMAIN`         | External domain for the BPP                           | `bpp-cdk.beckn-onix-aws-cdk.becknprotocol.io`             |
| `BPP_PRIVATE_KEY`             | Private key for the BPP                               | `pivurna3jQBmZGZeeOssgvD0NqMUuWedGjnM9U+hf8i5GXy3eoHVP7ZNs0CL+m7WB/Lq7L2/NvdPdiJWt9kjOQ==` |
| `BPP_PUBLIC_KEY`              | Public key for the BPP                               | `uRl8t3qB1T+2TbNAi/pu1gfy6uy9vzb3T3YiVrfZIzk=`          |

### SSL Certificate

| Variable                      | Description                                            | Example Value                                                |
|-------------------------------|--------------------------------------------------------|-------------------------------------------------------------|
| `CERT_ARN`                   | SSL certificate ARN (AWS Certificate Manager)         | `arn:aws:acm:ap-south-1:365975017663:certificate/04d1ef71-8407-495b-82f0-4eded8694189` |
                                                        |


## Deploy CDK

After you have made the relevant updates to the `.env` file, run the following commands to begin the deployment process.

### Deployment by Environment

You can now choose to deploy one of the following environments:

1. **Sandbox Environment**  
   This will deploy all the stacks including VPC, EKS, RDS, and the microservices like Redis, DocumentDB, and RabbitMQ:

   ```bash
   cdk deploy --context env=sandbox --all
   ```

2. Registry Environment
This will deploy the following stacks: VPC, EKS, and RDS:

```bash
cdk deploy --context env=registry --all
```

3. Gateway Environment
This will deploy the following stacks: VPC, EKS, and RDS:

```bash
cdk deploy --context env=gateway --all
```

4. BAP (Buyer Application Provider) Environment
This will deploy the following stacks: VPC, EKS, Redis, DocumentDB, and RabbitMQ:

```bash
cdk deploy --context env=bap --all
```

5. BPP (Buyer Platform Provider) Environment
This will deploy the following stacks: VPC, EKS, Redis, DocumentDB, and RabbitMQ:

```bash
cdk deploy --context env=bpp -all
```

## Next Steps

After installing all Beckn-Onix services, proceed with the next steps to complete the setup:

1. **[Verify Deployments](documentations/verify-deployments.md)**

   To ensure that your Beckn-Onix services are running correctly, follow the instructions in the [Verify Deployments](documentations/verify-deployments.md) document. This will help you confirm that the services are operational and identify any issues that need to be addressed.

2. **[Update DNS Records](documentations/post-deployment-dns-config.md)**

   To configure DNS settings for your services, follow the instructions provided in the [Post-Deployment DNS Configuration](documentations/post-deployment-dns-config.md) document. This will guide you through retrieving the necessary Load Balancer addresses and updating your DNS records.

3. **[Register BAP and BPP with Registry](documentations/post-deployment-bap-bpp-register.md)**

   After updating your DNS records, you need to register your participants BAP and BPP network with the registry service. Follow the steps in the [BAP and BPP Registration](documentations/post-deployment-bap-bpp-register.md) document to complete this process.

Make sure to follow the detailed steps in the linked documents to complete the setup and ensure your services are correctly configured and registered.

















