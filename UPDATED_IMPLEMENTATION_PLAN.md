# Disaster Resource Management System

## Updated Implementation Plan for Review

This plan keeps the locked architecture unchanged and updates the project roadmap based on the current repository state.

It answers three questions:

1. What is already implemented
2. What is missing to fully match the locked final system plan
3. What work should happen next, in the correct execution order

---

## 1. Locked Architecture Decisions

These decisions remain fixed and are not to be changed:

- Microservices architecture
- Central API Gateway
- Spring Cloud Config Server
- Eureka Service Registry
- Independent MySQL database per service
- RabbitMQ for audit and transparency events only
- JWT validated at the gateway
- React + Vite + TypeScript frontend
- Docker Compose as the full system startup mechanism
- ELK-style centralized logging with Actuator and correlation IDs

---

## 2. Current Repository Status

### Implemented

- Root monorepo structure
- Root Maven aggregator
- Config Server
- Service Registry
- API Gateway with JWT filter and route-level security config
- User Service with registration, login, roles, password hashing, JWT issuance
- User Service now distinguishes between immediately active donor registrations and pending-approval admin/manager registrations
- Shelter Service with CRUD, capacity, occupancy, and manager validation
- Resource Service with batch-based inventory, shortage analysis, reservation, release, and transfer confirmation
- Sharing & Transparency Service with shortage orchestration, matching, dispatch, receive, cancel, donation trace, and transparency lookup
- Frontend skeleton and working build
- Dockerfiles for backend services and frontend
- Docker Compose stack
- Postman collection
- DB init scripts
- Basic tests for selected backend logic
- Logging and RabbitMQ configuration assets
- Admin-facing backend support for user listing, health aggregation, and global transparency traces
- Admin-facing backend support for direct user creation and approval of pending public registrations
- Donor-facing backend support for donation history
- Shelter-manager-facing backend support for shortage and transfer listing
- Role-aware frontend navigation and dashboards
- Role-aware frontend forms now use explicit labels, example placeholders, and guided selection inputs for key workflows
- Demo guide, viva-defense notes, and Mermaid architecture diagrams
- Backend Dockerfiles optimized to use prebuilt jars
- Root Docker context filtering via `.dockerignore`

### Verified

- Frontend production build completes successfully
- Repository structure matches the intended monorepo layout
- Full backend Maven build completes successfully
- Current backend test suite completes successfully
- Role-based frontend structure is now implemented for admin, shelter manager, and donor flows
- Frontend production build remains green after role-based UI expansion
- Additional backend tests now cover:
  - gateway JWT parsing
  - resource reservation selection, release, and transfer confirmation
  - sharing workflow shortage validation, matching, receive, and cancel transitions
  - user controller list and current-user header flow
  - donor donation-history controller contract
  - admin/global transparency controller contract

### Not Yet Verified

- Full Docker Compose startup
- Full service discovery registration at runtime
- Full gateway-to-service routing at runtime
- Full RabbitMQ event flow at runtime
- Full ELK log ingestion at runtime
- Full UI-to-backend workflow at runtime

---

## 3. Gap Analysis Against the Locked Final Plan

These are the important gaps that must be closed to claim full alignment with the final system plan.

### Backend Gaps

- Service startup and integration behavior are not yet runtime-verified
- OpenAPI/Swagger endpoints exist in principle but are not yet confirmed live
- Cross-service failure handling needs live validation and likely refinement
- Automated tests are not yet broad enough for final submission

### Frontend Gaps

- Role-based structure is implemented, but still needs full live verification against running backend services
- Shelter approval is still operationally represented through shelter visibility and status fields, but not yet proven in a final live admin workflow
- Donor-centered and manager-centered flows need runtime validation through the full distributed stack

### Observability and Deployment Gaps

- ELK stack is configured but not proven live
- Docker Compose is defined but not proven end to end
- Config profiles need to be validated for both `dev` and `docker`
- One-command startup claim is not yet fully demonstrated

### Documentation Gaps

- Mermaid diagrams exist, and the architecture folder now needs exportable PNG/PDF outputs rather than only source markdown
- Demo guide and viva-defense notes exist, but still need final review against the final live stack

---

## 4. Revised Execution Plan

This is the updated plan from the current state to a defensible final release.

### Phase A: Build and Runtime Stabilization

**Goal**
Prove that the existing codebase actually compiles and boots as a distributed system.

**Tasks**

- Install and validate Maven in the working environment
- Run `mvn clean install`
- Fix all Java compile issues
- Fix Spring configuration or dependency issues
- Confirm every service can start individually
- Confirm Config Server delivers centralized configuration
- Confirm all services register in Eureka
- Confirm gateway routes traffic to services through discovery

**Exit Criteria**

- All backend modules compile successfully
- All backend services boot successfully
- Eureka shows the expected services
- Gateway can route to all core services

**Suggested Branches**

- `chore/build-stabilization`
- `fix/config-wiring`
- `fix/service-startup`

---

### Phase B: Core Workflow Verification and Hardening

**Goal**
Validate the main disaster-sharing flow and fix any backend logic gaps discovered during live execution.

**Tasks**

- Run the complete backend flow through Postman:
  - register user
  - login
  - create shelters
  - intake donation batch
  - create shortage
  - match shortage
  - dispatch transfer
  - receive transfer
  - query transparency chain
- Validate data ownership boundaries under real execution
- Fix any issues in reservation logic, transfer state transitions, and transparency persistence
- Validate that RabbitMQ is not carrying critical state
- Confirm source-of-truth ownership remains correct across services

**Exit Criteria**

- Full business flow works from API entry to transparency lookup
- No broken cross-service transitions remain
- Donation trace remains accurate from source to destination

**Suggested Branches**

- `fix/resource-workflow`
- `fix/sharing-workflow`
- `fix/transparency-trace`

---

### Phase C: Security and Contract Hardening

**Goal**
Make the security model and public API behavior submission-ready.

**Tasks**

- Confirm JWT issuance and validation with real requests
- Validate unauthorized and forbidden access behavior at the gateway
- Confirm services rely on gateway-provided identity headers as intended
- Standardize error responses where live inconsistencies appear
- Verify Swagger/OpenAPI endpoints for each service
- Sync Postman collection with the final live API behavior

**Exit Criteria**

- JWT and role restrictions work correctly
- Swagger works for all public backend services
- Postman collection matches final API contracts

**Suggested Branches**

- `fix/gateway-security`
- `chore/api-contract-sync`

---

### Phase D: Frontend Completion by Role

**Goal**
Bring the frontend into full alignment with the locked final UI plan.

**Tasks**

- Refactor the current frontend into explicit role-based dashboards
- Add Admin dashboard features:
  - user management
  - shelter monitoring/approval view
  - system health view
  - global transparency logs
- Add Shelter Manager dashboard features:
  - shelter profile and capacity
  - batch-level inventory
  - shortage creation
  - incoming/outgoing transfer tracking
  - receipt confirmation
- Add Donor dashboard features:
  - donation submission
  - donation history
  - donation transparency chain
- Improve route guards and role-based navigation
- Fix any UI/API mismatches found during live integration

**Exit Criteria**

- All three roles have clear and different experiences
- Full main scenario works through the UI
- The UI supports a real demo, not just backend testing

**Suggested Branches**

- `feat/frontend-role-dashboards`
- `feat/frontend-admin-console`
- `feat/frontend-shelter-manager-flow`
- `feat/frontend-donor-flow`

---

### Phase E: Observability and Deployment Verification

**Goal**
Prove that the platform is deployable and observable in the way the final plan promises.

**Tasks**

- Install and validate Docker and Docker Compose in the working environment
- Run `docker compose up --build`
- Fix any Docker build or startup issues
- Validate MySQL connectivity for all services
- Validate RabbitMQ availability
- Validate frontend accessibility through the compose stack
- Validate Actuator health endpoints
- Validate log generation and log shipping into ELK
- Confirm correlation IDs are visible in logs

**Exit Criteria**

- The full stack starts from one command
- Core services are reachable and healthy
- Centralized logs are viewable
- Note: current progress is blocked by local Docker engine `500` errors during image/container operations and should be resumed after Docker Desktop stabilization

**Suggested Branches**

- `fix/docker-compose-runtime`
- `fix/elk-observability`

---

### Phase F: Testing Expansion

**Goal**
Raise confidence and defendability before final submission.

**Tasks**

- Run existing tests
- Add unit tests for:
  - JWT logic
  - shelter rules
  - reservation and release logic
  - transfer transitions
  - shortage matching logic
- Add controller/integration tests per service
- Add gateway-level security verification tests
- Add at least one integration test for messaging behavior

**Current progress**

- JWT parsing test added
- resource workflow tests now cover FEFO-style reservation selection, release restoration, and transfer confirmation
- sharing workflow tests now cover shortage validation, matching, receive, and cancel transitions
- controller-level coverage now exists for user, donor inventory history, and global transparency endpoints
- remaining work is centered on broader integration coverage, gateway-route coverage, and messaging verification

**Exit Criteria**

- Core business logic is covered by automated tests
- High-risk paths have test protection

**Suggested Branches**

- `test/backend-core-logic`
- `test/gateway-security`
- `test/service-integration`

---

### Phase G: Documentation, Diagrams, and Viva Preparation

**Goal**
Finish the artifacts that make the system easy to explain, defend, and demonstrate.

**Tasks**

- Create the real system context diagram
- Create the real container diagram
- Create service component diagrams
- Create sequence diagrams for:
  - donation intake
  - shortage request and matching
  - transfer dispatch and receive
  - transparency lookup
- Expand setup guide with actual working commands
- Add final demo guide
- Add viva-defense notes for:
  - why microservices
  - why separate databases
  - why RabbitMQ is not on the critical path
  - why gateway-based JWT validation is correct
  - why batch-based inventory is realistic

**Exit Criteria**

- Docs are submission-ready
- Demo can be followed step by step
- Architecture can be defended clearly

**Suggested Branches**

- `docs/architecture-final`
- `docs/demo-guide`
- `docs/viva-defense`

---

## 5. New Priority Order

From this point onward, the safest order is:

1. Build stabilization
2. Runtime verification
3. Core workflow hardening
4. Security and contract verification
5. Frontend role completion
6. Docker and observability verification
7. Test expansion
8. Final documentation and demo preparation

This order avoids polishing the UI before the distributed backend is proven stable.

---

## 6. Updated Definition of Done

The project should be considered complete only when all of the following are true:

- All backend services compile successfully
- All backend services run successfully
- Config Server, Eureka, and Gateway work together correctly
- Full API workflow works through Postman
- Full main workflow works through the frontend
- JWT and role-based access work correctly
- RabbitMQ audit events are visible
- ELK logging is visible
- Docker Compose starts the full system successfully
- Swagger is accessible and correct
- Diagrams and docs are complete
- The team can explain and defend every architecture decision in a viva

---

## 7. Immediate Next Tasks

These are the next tasks to execute now:

1. Add the next round of integration coverage for gateway routing and cross-service contracts
2. Boot all backend services locally or through Docker
3. Validate Config Server, Eureka, and Gateway behavior
4. Run the full Postman scenario
5. Fix backend workflow issues discovered during live testing
6. Resume Docker Compose verification after Docker Desktop stabilization
7. Export final diagrams and finish acceptance documentation

---

## 8. Review Notes

This updated plan does not replace the locked architecture.

It refines execution based on the current repository reality:

- the structure exists
- most backend code exists
- the frontend now includes role-aware flows
- the stack still needs runtime, integration, and final Docker verification to fully satisfy the locked final plan
