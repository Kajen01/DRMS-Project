# Disaster Resource Management System

A complete microservices-based platform for disaster shelter operations, resource inventory tracking, shelter-to-shelter sharing, and donation transparency.

## Platform Components

- `backend/config-server`: Spring Cloud Config Server for centralized configuration
- `backend/service-registry`: Eureka service discovery
- `backend/api-gateway`: Spring Cloud Gateway with JWT validation
- `backend/user-service`: identity, roles, and authentication
- `backend/shelter-service`: shelter and capacity management
- `backend/resource-service`: batch-based inventory and reservations
- `backend/sharing-transparency-service`: shortage matching, transfers, and transparency timeline
- `frontend/web-client`: React + Vite + TypeScript client
- `infra/compose/docker-compose.yml`: local orchestration for the full stack

## Core Capabilities

- JWT-based authentication and role-aware access
- Admin approval workflow for public `ADMIN` and `SHELTER_MANAGER` registrations
- Admin-managed creation of users and shelters
- Independent databases per service
- Batch-based inventory with reservation and FEFO-inspired matching
- Shelter-to-shelter transfer workflow
- Donation traceability from donor reference to destination shelter
- RabbitMQ-powered audit events
- Actuator health endpoints and centralized logging assets

## Technology Stack

- Java 21
- Spring Boot 3.3
- Spring Cloud 2023
- MySQL 8
- RabbitMQ
- React 18
- Vite 5
- Docker Compose

## Repository Layout

```text
backend/
frontend/
docs/
infra/
postman/
scripts/
```

## Local Development

### Backend

The backend uses Maven multi-module builds with one Spring Boot application per service.

### Frontend

The frontend is a Vite React TypeScript app under `frontend/web-client`.

### Full Stack

The intended production-like local flow is:

1. Start infrastructure and services with Docker Compose.
2. Access the frontend via the web client.
3. Validate backup flows with Postman.

## Bootstrap Admin Account

On a fresh user-service database, the system creates a default active admin account automatically:

- Email: `admin01@gmail.com`
- Username: `admin01`
- Password: `Admin@123`

Use this account to approve pending public registrations and to create active admin or shelter manager users directly.

## Notes

- Backend tests and frontend production builds have been verified locally from this repository.
- Full Docker Compose runtime verification still depends on the local Docker Desktop environment being stable and available.
