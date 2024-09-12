# Beckn-ONIX AWS CDK Helm Charts

This repository contains Helm charts for deploying the Beckn-ONIX services on AWS using the AWS CDK framework. The charts are designed to deploy the following applications:

- **Registry**: Manages Beckn service providers and categories, and provides an additional layer of trust on the network by listing platforms that are compliant to a network’s rules and policies.
- **Gateway**: Central point for routing Beckn messages between providers and participants.
- **BAP (Beckn Application Platform)**: A consumer-facing infrastructure which captures consumers’ requests via its UI applications, converts them into beckn-compliant schemas and APIs at the server side, and fires them at the network.
- **BPP (Beckn Provider Platform)**: Other side of the network is the supply side which consists of Beckn Provider Platforms (BPPs) that maintain an active inventory, one or more catalogs of products and services, implement the supply logic and enable fulfillment of orders.

## Prerequisites

- An Amazon EKS cluster
- Kubectl client configured with Amazon EKS cluster
- Helm 3 client
- A PostgreSQL database instance (managed by AWS RDS Aurora in this case)
- Public domain/sub-domain along with SSL certificates (for HTTPS)


### Domain and Subdomains

Beckn-ONIX requires a public domain to be associated with the following services:

- Registry
- Gateway
- BAP Network
- BPP Network

Users must obtain a public domain and create subdomains for each service. Additionally, an SSL certificate must be issued for each subdomain to enable HTTPS. You can use [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/pricing/), which provides public SSL/TLS certificates at no cost.

## Requesting a Public SSL Certificate through AWS Certificate Manager

Gather the list of subdomains you intend to use for Beckn-ONIX services (as outlined in the pre-requisite).

To obtain an SSL certificate through AWS Certificate Manager, follow the easy steps provided in the official [AWS ACM Documentation](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html).

Once a certificate is issued, copy the certificate ARN to be used in the Helm charts. The certificate ARN follows this format:

`arn:aws:acm:ap-south-1:<aws-account-id>:certificate/<identifier>`

## Helm Parameters
Before installing the Helm chart, it’s important to familiarize yourself with all the available parameters. Each parameter allows you to customize the Helm chart according to your deployment needs. Review the descriptions and default values to understand how they will impact your setup.

**Note:** If a parameter does not have a default value listed, you are expected to provide a value for it during Helm installation.

### Registry Parameters

| Name                          | Description                             | Default Value                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `externalDomain`               | External domain for the Registry service, e.g. <br> `registry.beckn-onix-aws-cdk.becknprotocol.io`|           |
| `database.host`                | PostgreSQL database host, e.g. <br> `beckn-onix-registry.ap-south-1.rds.amazonaws.com`|          |
| `database.dbname`              | PostgreSQL database name                 | `registry`                                            |
| `database.username`            | PostgreSQL database username             | `postgres`                                            |
| `database.password`            | PostgreSQL database password             |                                         |
| `ingress.tls.certificateArn`   | ARN for the TLS certificate, e.g. <br> `arn:aws:acm:region:account-id:certificate/certificate-id`|            |

---

### Gateway Parameters

| Name                          | Description                             | Default Value                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `externalDomain`               | External domain for the Gateway service, e.g. <br> `gateway.beckn-onix-aws-cdk.becknprotocol.io`|         |
| `registry_url`                 | Registry URL for Beckn services, e.g.  <br> `https://registry.beckn-onix-aws-cdk.becknprotocol.io`|         |
| `database.host`                | PostgreSQL database host, e.g. <br> `beckn-onix-registry.ap-south-1.rds.amazonaws.com`|        |
| `database.dbname`              | PostgreSQL database name                 | `gateway`                                             |
| `database.username`            | PostgreSQL database username             | `postgres`                                            |
| `database.password`            | PostgreSQL database password             |                                        |
| `ingress.tls.certificateArn`   | ARN for the TLS certificate, e.g. <br> `arn:aws:acm:region:account-id:certificate/certificate-id`|           |

---

### BAP/BPP Parameters

| Name                                      | Description                                        | Default Value                                               |
| ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| `global.externalDomain`                   | External domain for the BAP/BPP network service, e.g. `bap-network.beckn-onix-aws-cdk.becknprotocol.io` (BAP), `bpp-network.beckn-onix-aws-cdk.becknprotocol.io` (BPP)|           |
| `global.registry_url`                     | Registry URL for Beckn services, e.g. `https://registry.beckn-onix-aws-cdk.becknprotocol.io`|                         |
| `global.responseCacheMongo.username`      | MongoDB username for response caching              | `root`                                              |
| `global.responseCacheMongo.password`      | MongoDB password for response caching              |
| `global.responseCacheMongo.host`      | MongoDB host for response caching              | `mongodb.bap-common-services.svc.cluster.local` | 
| `global.rabbitMQamqp.password`            | RabbitMQ AMQP password for message processing      |                                           |
| `global.rabbitMQamqp.host`            | RebbitMQ host | `rabbitmq.bap-common-services.svc.cluster.local` |
| `global.redisCache.host`            | Redis host | `redis-master.bap-common-services.svc.cluster.local ` |
| `global.ingress.tls.certificateArn`       | ARN for the TLS certificate, e.g. `arn:aws:acm:region:account-id:certificate/certificate-id`|             |

## Installing the Charts

Before installing the charts, ensure AWS RDS Aurora PostgreSQL database is running and accessible from your EKS cluster.

### Beckn-ONIX Registry

```bash
helm install registry . \
  --set externalDomain=<registry_external_domain> \
  --set database.host=<rds_postgres_database_hostname> \
  --set database.password=<db_password> \
  --set ingress.tls.certificateArn="aws_certificate_manager_arm"
```
### Beckn-ONIX Gateway

```bash
helm install gateway . \
  --set externalDomain=<gateway_external_domain> \
  --set registry_url=https://<registry_domain> \
  --set database.host=<rds_postgres_database_hostname> \
  --set database.password=<rds_postgres_db_password> \
  --set ingress.tls.certificateArn="aws_certificate_manager_arm"
```

### Common Services Charts for BAP & BPP

BAP and BPP services require Redis, MongoDB, and RabbitMQ. These services must be installed before deploying Beckn-ONIX. You can use Bitnami Helm charts for installation: [Bitnami Helm Charts](https://github.com/bitnami/charts/tree/main/bitnami/).

#### Install Common Services for BAP

#### Create Namespace and Add Bitnami Helm Repository

```bash
   kubectl create namespace bap-common-services
   helm repo add bitnami https://charts.bitnami.com/bitnami
```

#### Install Redis
```bash
helm install -n bap-common-services redis bitnami/redis --version 16.13.2 \
--set auth.enabled=false \
--set replica.replicaCount=0 \
--set master.persistence.storageClass="gp2" 
```

#### Install MongoDB
```bash
helm install -n bap-common-services mongodb bitnami/mongodb \
--set persistence.storageClass="gp2"

# To get the Mongodb root password run:
kubectl get secret --namespace bap-common-services mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 -d)
```

#### Install RabbitMQ
```
helm install -n bap-common-services rabbitmq bitnami/rabbitmq \
--set persistence.enabled=true \
--set persistence.storageClass="gp2" \
--set auth.username=beckn \
--set auth.password="<password-of-your-choice>"
```

#### Install Common Services for BAP
For BPP, follow the same installation steps as for BAP, but with modifications specific to the BPP K8s namespace:

1. **Create Namespace and Add Bitnami Helm Repository**

```bash
   kubectl create namespace bap-common-services
   helm repo add bitnami https://charts.bitnami.com/bitnami
```
2. **Update Namespace and Re-run commands**

After creating the namespace, you need to re-run the installation commands for Redis, MongoDB, and RabbitMQ from the BAP section with the namespace updated to `bpp-common-services`.

Example for Redis:
```bash
helm install -n bpp-common-services redis bitnami/redis --version 16.13.2 \
--set auth.enabled=false \
--set replica.replicaCount=0 \
--set master.persistence.storageClass="gp2"
```

### Proceed to Install Beckn-ONIX BAP & BPP

#### Beck-ONIX BAP

```bash
helm install beckn-onix-bap . \
  --set global.externalDomain=<bap_network_external_domain> \
  --set global.registry_url=https://<registry_domain> \
  --set global.responseCacheMongo.password=<mongodb_root_password> \
  --set global.rabbitMQamqp.password=<amq_password> \
  --set ingress.tls.certificateArn="aws_certificate_manager_arm"
```

#### Beckn-ONIX BPP

```bash
helm install beckn-onix-bpp . \
  --set global.externalDomain=<bpp_network_external_domain> \
  --set global.registry_url=https://<registry_domain> \
  --set global.responseCacheMongo.password=<mongodb_root_password> \
  --set global.rabbitMQamqp.password=<amq_password> \
  --set ingress.tls.certificateArn="aws_certificate_manager_arm"
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
