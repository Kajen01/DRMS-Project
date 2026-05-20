# Demo Guide

## Goal

Demonstrate a realistic end-to-end disaster resource sharing flow with full traceability.

## Demo Roles

- `ADMIN`
- `SHELTER_MANAGER`
- `DONOR`

## Recommended Demo Flow

### 1. Start the Platform

Use the root runbook:

- [RUN_COMMANDS.txt](/D:/disaster-resource-management-system/RUN_COMMANDS.txt)

Preferred stack startup:

```bash
docker compose -f infra/compose/docker-compose.yml up --build
```

### 2. Verify Core Infrastructure

Show:

- Config Server on `8888`
- Eureka dashboard on `8761`
- API Gateway on `8080`
- Frontend on `5173`

### 3. Register Users

Create at least:

- one `ADMIN`
- one `SHELTER_MANAGER`
- one `DONOR`

### 4. Admin Demonstration

From the frontend:

- log in as `ADMIN`
- open the admin dashboard
- show user management
- show shelter oversight
- show system health aggregation
- show global transparency logs

### 5. Shelter Setup

Create at least two shelters:

- Shelter A with available stock
- Shelter B with a shortage

Assign the shelter manager user to the shelter manager-owned shelter.

### 6. Donor Demonstration

From the frontend:

- log in as `DONOR`
- submit a donation batch into Shelter A
- show that the donation appears in donor history
- note the donation reference

### 7. Shelter Manager Demonstration

From the frontend:

- log in as `SHELTER_MANAGER`
- open the inventory view for the managed shelter
- create a shortage request for Shelter B
- trigger transfer matching
- dispatch the transfer
- confirm transfer receipt

### 8. Transparency Demonstration

Use the donation reference and show:

- donation trace lookup
- donor -> source shelter -> transfer -> destination shelter
- admin global transparency listing

### 9. Optional Operational Demonstration

Show:

- Actuator health visibility
- centralized logs
- RabbitMQ management UI

## Expected Talking Points

- stock truth is owned only by the resource service
- transfers are orchestrated by the sharing service
- JWT is enforced at the gateway
- RabbitMQ supports audit and traceability, not critical stock truth
- each service has its own database

## Demo Backup Path

If the frontend is unavailable during the presentation:

- use [postman/Disaster-Resource-System.postman_collection.json](/D:/disaster-resource-management-system/postman/Disaster-Resource-System.postman_collection.json)
- walk through the same scenario at the API level
