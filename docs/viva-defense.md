# Viva Defense Notes

## Why Microservices?

- User, shelter, resource, and sharing domains evolve independently
- inventory and transfer workflow are separate bounded contexts
- service isolation improves fault containment
- the architecture reflects a realistic enterprise disaster management platform

## Why an API Gateway?

- one controlled entry point for the frontend
- centralized JWT validation
- centralized route and role enforcement
- cleaner service boundaries because internal services do not need public exposure

## Why Config Server?

- avoids configuration duplication across services
- supports `dev` and `docker` profiles
- keeps deployment behavior consistent

## Why Eureka Service Discovery?

- avoids hardcoded internal service URLs
- supports dynamic service registration
- aligns with Spring Cloud microservice patterns

## Why Separate Databases Per Service?

- each service owns its own source of truth
- no cross-service joins
- no accidental schema coupling
- easier to defend in terms of loose coupling and service autonomy

## Why Batch-Based Inventory?

- disaster resource management is not just total quantities
- expiry-aware stock matters
- source donation references matter
- transfer traceability depends on knowing which batch moved where

## Why RabbitMQ Is Not on the Critical Path?

- stock truth should remain deterministic and easier to debug
- transfer state transitions should not depend on eventual consistency
- messaging is used for audit, transparency timeline, and future notifications
- this gives the system event awareness without making correctness harder to prove

## Why JWT at the Gateway?

- authentication is centralized
- route protection is enforced once, consistently
- downstream services receive identity context through headers
- services stay focused on business logic instead of token parsing

## Why ELK and Correlation IDs?

- distributed systems are harder to debug without centralized logs
- correlation IDs help trace a request across services
- this adds operational realism without requiring a full production platform

## Why Docker Compose?

- one-command startup is easier for demonstration and grading
- removes machine-specific setup differences
- proves the platform is deployable as a complete system

## Main Defense Summary

This architecture is appropriate because the problem is naturally distributed:

- identity is separate from shelter operations
- shelter operations are separate from inventory truth
- inventory truth is separate from orchestration and transparency workflow

The design is not complexity for its own sake. It directly supports:

- traceability
- service ownership
- auditability
- cleaner failure boundaries
- easier explanation of data ownership
