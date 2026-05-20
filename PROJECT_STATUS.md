# Project Status

Last updated: 2026-05-17

## Completed

- Full backend Maven build passes
- Current backend test suite passes
- Spring Boot service jars package successfully
- Gateway JWT handling now forwards:
  - `X-User-Email`
  - `X-User-Role`
  - `X-User-Id`
- Admin backend support added:
  - list users
  - aggregated system health endpoint
  - global transparency trace listing
- Donor backend support added:
  - donation history by logged-in donor
  - donor identity stored on resource batches
- Shelter manager backend support added:
  - transfer listing by shelter and direction
  - shortage listing by shelter
- Public registration now requires admin approval for:
  - ADMIN accounts
  - SHELTER_MANAGER accounts
- Admin bootstrap account added for first-time access
- Frontend role-based structure improved:
  - admin navigation and pages
  - shelter manager navigation and pages
  - donor donation flow and history
  - admin user management page
  - admin system health page
  - admin global transparency view
  - labeled form inputs with guided placeholders
  - shelter manager selection instead of raw manager ID entry
  - active shelter selection instead of raw shelter ID entry for donor donations where possible
  - approval-oriented user administration flow
- Frontend production build passes
- Demo guide, viva-defense notes, and Mermaid architecture diagrams added
- Added backend tests for:
  - gateway JWT parsing
  - resource reservation selection
  - resource release restoration
  - resource transfer confirmation
  - sharing workflow shortage validation
  - sharing workflow match transition
  - sharing workflow receive transition
  - sharing workflow cancel transition
  - user controller list endpoint
  - user controller current-user header flow
  - resource controller donation-history endpoint
  - transparency controller trace listing endpoint
- Docker build flow improved:
  - backend Dockerfiles now use prebuilt local jars
  - root `.dockerignore` added to reduce context size

## In Progress

- Full Docker Compose runtime verification
- Final expansion of automated controller and integration test coverage
- Final documentation polish

## Blocked

- Docker runtime verification is currently blocked by the local Docker engine returning internal API `500` responses during image/container operations
- The latest Docker check also showed periods where the Docker daemon was not running at all
- This is now an environment/runtime issue, not a Java compile or frontend build issue

## Next Recommended Steps

1. Restart Docker Desktop completely
2. Re-run:
   `mvn clean install -DskipTests`
3. Re-run:
   `docker compose -f infra/compose/docker-compose.yml up --build`
4. Verify service health and gateway routing
5. Run the Postman flow
6. Run the frontend flow
7. Add gateway-route and cross-service integration tests
8. Fix any runtime-only issues that appear
