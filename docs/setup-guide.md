# Setup Guide

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 22+
- Docker Desktop with Compose

## Run Order

1. Start the platform with Docker Compose.
2. Open the frontend.
3. Use Postman for backup API validation.

## Default Ports

- Config Server: `8888`
- Eureka: `8761`
- API Gateway: `8080`
- User Service: `8081`
- Shelter Service: `8082`
- Resource Service: `8083`
- Sharing Service: `8084`
- Frontend Dev Server: `5173`
- RabbitMQ Management: `15672`
- Elasticsearch: `9200`
- Kibana: `5601`

## Development Notes

- Service configuration is centralized through Config Server native files.
- Each service owns its own MySQL database.
- The sharing service orchestrates transfers; the resource service owns stock truth.
