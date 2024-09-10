# Beckn-ONIX AWS CDK Helm Charts

This repository contains Helm charts for deploying the Beckn-ONIX services on AWS using the AWS CDK framework. The charts are designed to deploy the following applications:

- **Registry**: Manages Beckn service providers and categories, and provides an additional layer of trust on the network by listing platforms that are compliant to a network’s rules and policies.
- **Gateway**: Central point for routing Beckn messages between providers and participants.
- **BAP (Beckn Application Platform)**: A consumer-facing infrastructure which captures consumers’ requests via its UI applications, converts them into beckn-compliant schemas and APIs at the server side, and fires them at the network.
- **BPP (Beckn Provider Platform)**: Other side of the network is the supply side which consists of Beckn Provider Platforms (BPPs) that maintain an active inventory, one or more catalogs of products and services, implement the supply logic and enable fulfillment of orders.

## Prerequisites

- A Kubernetes cluster with Helm 3 installed.
- An AWS account with appropriate permissions.
- A PostgreSQL database instance (managed by AWS RDS Aurora in this case).

## Helm Parameters

### Registry Parameters

| Name                          | Description                             | Value                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `externalDomain`               | External domain for the Registry service | e.g. `registry.beckn-onix-aws-cdk.becknprotocol.io`        |
| `database.host`                | PostgreSQL database host                 | e.g. `beckn-onix-registry.cluster-chnxpgur8sy1.ap-south-1.rds.amazonaws.com` |
| `database.dbname`              | PostgreSQL database name                 | `registry`                                            |
| `database.username`            | PostgreSQL database username             | `postgres`                                            |
| `database.password`            | PostgreSQL database password             | `becknonix123`                                        |
| `ingress.tls.certificateArn`   | ARN for the TLS certificate              | e.g. `arn:aws:acm:region:account-id:certificate/certificate-id` |

---

### Gateway Parameters

| Name                          | Description                             | Value                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `externalDomain`               | External domain for the Gateway service | e.g. `gateway.beckn-onix-aws-cdk.becknprotocol.io`         |
| `registry_url`                 | Registry URL for Beckn services          | e.g. `https://registry.beckn-onix-aws-cdk.becknprotocol.io`|
| `database.host`                | PostgreSQL database host                 | e.g. `beckn-onix-registry.cluster-chnxpgur8sy1.ap-south-1.rds.amazonaws.com` |
| `database.dbname`              | PostgreSQL database name                 | `gateway`                                             |
| `database.username`            | PostgreSQL database username             | `postgres`                                            |
| `database.password`            | PostgreSQL database password             | `becknonix123`                                        |
| `ingress.tls.certificateArn`   | ARN for the TLS certificate              | e.g. `arn:aws:acm:region:account-id:certificate/certificate-id` |

---

### BAP/BPP Parameters

| Name                                      | Description                                        | Value                                               |
| ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| `global.externalDomain`                   | External domain for the BAP/BPP network service     | e.g. `bap-network.beckn-onix-aws-cdk.becknprotocol.io` (BAP), e.g. `bpp-network.beckn-onix-aws-cdk.becknprotocol.io` (BPP) |
| `global.registry_url`                     | Registry URL for Beckn services                    | e.g. `https://registry.beckn-onix-aws-cdk.becknprotocol.io` |
| `global.responseCacheMongo.username`      | MongoDB username for response caching              | `root`                                              |
| `global.responseCacheMongo.password`      | MongoDB password for response caching              |
| `global.rabbitMQamqp.password`            | RabbitMQ AMQP password for message processing      | `beckn123`                                          |
| `global.ingress.tls.certificateArn`       | ARN for the TLS certificate                        | e.g. `arn:aws:acm:region:account-id:certificate/certificate-id` |


## Installing the Charts

Before installing the charts, ensure the PostgreSQL database is running and accessible from your Kubernetes cluster.

### Beckn-ONIX Registry

```bash
helm install registry . \
  --set externalDomain=registry.beckn-onix-aws-cdk.becknprotocol.io \
  --set registry_url=https://<registry_domain> \
  --set database.host=<database_hostname> \
  --set database.password=<db_password> \
  --set ingress.tls.certificateArn="arn:aws:acm:region:account-id:certificate/certificate-id"
```
### Beckn-ONIX Gateway

```bash
helm install gateway . \
  --set externalDomain=gateway.beckn-onix-aws-cdk.becknprotocol.io \
  --set registry_url=https://<registry_domain> \
  --set database.host=<database_hostname> \
  --set database.password=<db_password> \
  --set ingress.tls.certificateArn="arn:aws:acm:region:account-id:certificate/certificate-id"
```

### Beckn-ONIX BAP

```bash
helm install beckn-onix-bap . \
  --set global.externalDomain=bap-network.beckn-onix-aws-cdk.becknprotocol.io \
  --set global.registry_url=https://<registry_domain> \
  --set global.responseCacheMongo.password="<password>" \
  --set global.rabbitMQamqp.password="beckn123" \
  --set global.ingress.tls.certificateArn="arn:aws:acm:region:account-id:certificate/certificate-id"
```

### Beckn-ONIX BPP

```bash
helm install beckn-onix-bpp . \
  --set global.externalDomain=bpp-network.beckn-onix-aws-cdk.becknprotocol.io \
  --set global.registry_url=https://<registry_domain> \
  --set global.responseCacheMongo.password="<password>" \
  --set global.rabbitMQamqp.password="beckn123" \
  --set global.ingress.tls.certificateArn="arn:aws:acm:region:account-id:certificate/certificate-id"
```

