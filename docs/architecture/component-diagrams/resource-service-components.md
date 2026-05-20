# Resource Service Components

```mermaid
flowchart LR
    Controller["ResourceController"] --> Service["ResourceInventoryService"]
    Service --> BatchRepo["ResourceBatchRepository"]
    Service --> ReservationRepo["StockReservationRepository"]
    Service --> Mapper["ResourceMapper"]
    Service --> Publisher["EventPublisherService"]
```
