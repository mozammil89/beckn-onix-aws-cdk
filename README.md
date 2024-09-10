# Beckn-ONIX AWS CDK Helm Charts

This repository contains Helm charts for deploying the Beckn-ONIX services on AWS using the AWS CDK framework. The charts are designed to deploy the following applications:

- **Registry**: Manages Beckn service providers and categories.
- **Gateway**: Central point for routing Beckn messages between providers and participants.
- **BAP (Beckn Application Platform)**: Allows providers to advertise their services to participants.
- **BPP (Beckn Provider Platform)**: Handles the processing of Beckn messages on behalf of providers and participants.

## Prerequisites

- A Kubernetes cluster with Helm 3 installed.
- An AWS account with appropriate permissions.
- A PostgreSQL database instance (managed by AWS RDS Aurora in this case).

## Helm Parameters

### Registry Parameters

| Name                          | Description                             | Value                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `externalDomain`               | External domain for the Registry service | `registry.beckn-onix-aws-cdk.becknprotocol.io`        |
| `database.host`                | PostgreSQL database host                 | `beckn-onix-registry.cluster-chnxpgur8sy1.ap-south-1.rds.amazonaws.com` |
| `database.dbname`              | PostgreSQL database name                 | `registry`                                            |
| `database.username`            | PostgreSQL database username             | `postgres`                                            |
| `database.password`            | PostgreSQL database password             | `becknonix123`                                        |
| `ingress.tls.certificateArn`   | ARN for the TLS certificate              | `arn:aws:acm:ap-south-1:365975017663:certificate/04d1ef71-8407-495b-82f0-4eded8694189` |

---

### Gateway Parameters

| Name                          | Description                             | Value                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `externalDomain`               | External domain for the Gateway service | `gateway.beckn-onix-aws-cdk.becknprotocol.io`         |
| `registry_url`                 | Registry URL for Beckn services          | `https://registry.beckn-onix-aws-cdk.becknprotocol.io`|
| `database.host`                | PostgreSQL database host                 | `beckn-onix-registry.cluster-chnxpgur8sy1.ap-south-1.rds.amazonaws.com` |
| `database.dbname`              | PostgreSQL database name                 | `gateway`                                             |
| `database.username`            | PostgreSQL database username             | `postgres`                                            |
| `database.password`            | PostgreSQL database password             | `becknonix123`                                        |
| `ingress.tls.certificateArn`   | ARN for the TLS certificate              | `arn:aws:acm:ap-south-1:365975017663:certificate/04d1ef71-8407-495b-82f0-4eded8694189` |

---

### BAP/BPP Parameters

| Name                                      | Description                                        | Value                                               |
| ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| `global.externalDomain`                   | External domain for the BAP/BPP network service     | `bap-network.beckn-onix-aws-cdk.becknprotocol.io` (BAP), `bpp-network.beckn-onix-aws-cdk.becknprotocol.io` (BPP) |
| `global.registry_url`                     | Registry URL for Beckn services                    | `https://registry.beckn-onix-aws-cdk.becknprotocol.io` |
| `global.responseCacheMongo.username`      | MongoDB username for response caching              | `root`                                              |
| `global.responseCacheMongo.password`      | MongoDB password for response caching              | `ImYeQLeqwE` (BAP), `3jEGFUgZgC` (BPP)              |
| `global.rabbitMQamqp.password`            | RabbitMQ AMQP password for message processing      | `beckn123`                                          |
| `global.ingress.tls.certificateArn`       | ARN for the TLS certificate                        | `arn:aws:acm:ap-south-1:365975017663:certificate/04d1ef71-8407-495b-82f0-4eded8694189` |


## Installing the Charts

Before installing the charts, ensure the PostgreSQL database is running and accessible from your Kubernetes cluster.

### Beckn-ONIX Registry

```bash
helm install registry . \
  --set externalDomain=registry.beckn-onix-aws-cdk.becknprotocol.io \
  --set registry_url=https://<registry_domain> \
  --set database.host=<database_hostname> \
  --set database.password=<db_password>3 \
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
  --set global.responseCacheMongo.username="root" \
  --set global.responseCacheMongo.password="ImYeQLeqwE" \
  --set global.rabbitMQamqp.password="beckn123" \
  --set global.ingress.tls.certificateArn="arn:aws:acm:region:account-id:certificate/certificate-id"
```

### Beckn-ONIX BPP

```bash
helm install beckn-onix-bpp . \
  --set global.externalDomain=bpp-network.beckn-onix-aws-cdk.becknprotocol.io \
  --set global.registry_url=https://<registry_domain> \
  --set global.responseCacheMongo.username="root" \
  --set global.responseCacheMongo.password="3jEGFUgZgC" \
  --set global.rabbitMQamqp.password="beckn123" \
  --set global.ingress.tls.certificateArn="arn:aws:acm:region:account-id:certificate/certificate-id"
```

