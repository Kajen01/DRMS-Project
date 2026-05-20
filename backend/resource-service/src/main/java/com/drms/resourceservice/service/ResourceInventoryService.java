package com.drms.resourceservice.service;

import com.drms.resourceservice.dto.BatchIntakeRequest;
import com.drms.resourceservice.dto.BatchResponse;
import com.drms.resourceservice.dto.DonationHistoryResponse;
import com.drms.resourceservice.dto.ExcessStockView;
import com.drms.resourceservice.dto.ReservationRequest;
import com.drms.resourceservice.dto.ShortageAnalysisRequest;
import com.drms.resourceservice.dto.ShortageAnalysisResponse;
import com.drms.resourceservice.dto.StockReservationResponse;
import com.drms.resourceservice.dto.TransferConfirmRequest;
import com.drms.resourceservice.entity.ReservationStatus;
import com.drms.resourceservice.entity.ResourceBatch;
import com.drms.resourceservice.entity.ResourceCategory;
import com.drms.resourceservice.entity.StockReservation;
import com.drms.resourceservice.exception.ConflictException;
import com.drms.resourceservice.exception.NotFoundException;
import com.drms.resourceservice.mapper.ResourceMapper;
import com.drms.resourceservice.repository.ResourceBatchRepository;
import com.drms.resourceservice.repository.StockReservationRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResourceInventoryService {

    private final ResourceBatchRepository batchRepository;
    private final StockReservationRepository reservationRepository;
    private final ResourceMapper resourceMapper;
    private final EventPublisherService eventPublisherService;

    public ResourceInventoryService(
            ResourceBatchRepository batchRepository,
            StockReservationRepository reservationRepository,
            ResourceMapper resourceMapper,
            EventPublisherService eventPublisherService
    ) {
        this.batchRepository = batchRepository;
        this.reservationRepository = reservationRepository;
        this.resourceMapper = resourceMapper;
        this.eventPublisherService = eventPublisherService;
    }

    @Transactional
    public BatchResponse intake(BatchIntakeRequest request, String donorEmail) {
        String donationReference = generateDonationReference();
        ResourceBatch batch = ResourceBatch.builder()
                .shelterId(request.shelterId())
                .donorEmail(donorEmail)
                .resourceType(request.resourceType())
                .resourceName(request.resourceName())
                .unit(request.unit())
                .quantityReceived(request.quantityReceived())
                .quantityAvailable(request.quantityReceived())
                .expiryDate(request.expiryDate())
                .sourceDonationRef(donationReference)
                .receivedAt(Instant.now())
                .build();
        ResourceBatch saved = batchRepository.save(batch);
        eventPublisherService.publish("donation.logged", Map.of(
                "batchId", saved.getId(),
                "shelterId", saved.getShelterId(),
                "resourceName", saved.getResourceName(),
                "donationRef", saved.getSourceDonationRef()
        ));
        return resourceMapper.toBatchResponse(saved);
    }

    public DonationHistoryResponse getDonationHistory(String donorEmail) {
        List<BatchResponse> batches = batchRepository.findByDonorEmailOrderByReceivedAtDesc(donorEmail).stream()
                .map(resourceMapper::toBatchResponse)
                .toList();
        return new DonationHistoryResponse(donorEmail, batches.size(), batches);
    }

    public List<BatchResponse> getByShelter(Long shelterId) {
        return batchRepository.findByShelterIdOrderByReceivedAtDesc(shelterId).stream()
                .map(resourceMapper::toBatchResponse)
                .toList();
    }

    public List<ExcessStockView> getExcess(String resourceType, String resourceName, int minimumAvailable) {
        List<ResourceBatch> batches = batchRepository.findAll().stream()
                .filter(batch -> batch.getQuantityAvailable() >= minimumAvailable)
                .filter(batch -> batch.getExpiryDate() == null || !batch.getExpiryDate().isBefore(LocalDate.now()))
                .filter(batch -> resourceName == null || batch.getResourceName().equalsIgnoreCase(resourceName))
                .filter(batch -> resourceType == null || batch.getResourceType() == ResourceCategory.valueOf(resourceType))
                .sorted(Comparator.comparing(ResourceBatch::getExpiryDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
        return batches.stream().map(resourceMapper::toExcessView).toList();
    }

    public ShortageAnalysisResponse analyzeShortage(ShortageAnalysisRequest request) {
        int available = batchRepository.findByShelterIdAndResourceNameIgnoreCase(request.shelterId(), request.resourceName())
                .stream()
                .filter(batch -> batch.getResourceType() == request.resourceType())
                .mapToInt(ResourceBatch::getQuantityAvailable)
                .sum();
        int shortage = Math.max(0, request.requiredQuantity() - available);
        return new ShortageAnalysisResponse(
                request.shelterId(),
                request.resourceName(),
                available,
                request.requiredQuantity(),
                shortage,
                shortage > 0
        );
    }

    @Transactional
    public StockReservationResponse reserve(ReservationRequest request) {
        ResourceBatch batch = batchRepository.findAll().stream()
                .filter(candidate -> candidate.getShelterId().equals(request.sourceShelterId()))
                .filter(candidate -> candidate.getResourceType() == request.resourceType())
                .filter(candidate -> candidate.getResourceName().equalsIgnoreCase(request.resourceName()))
                .filter(candidate -> candidate.getUnit().equalsIgnoreCase(request.unit()))
                .filter(candidate -> candidate.getQuantityAvailable() >= request.quantity())
                .filter(candidate -> candidate.getExpiryDate() == null || !candidate.getExpiryDate().isBefore(LocalDate.now()))
                .sorted(Comparator.comparing(ResourceBatch::getExpiryDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .findFirst()
                .orElseThrow(() -> new ConflictException("No eligible batch available to reserve"));

        batch.setQuantityAvailable(batch.getQuantityAvailable() - request.quantity());
        StockReservation reservation = reservationRepository.save(StockReservation.builder()
                .batchId(batch.getId())
                .sourceShelterId(request.sourceShelterId())
                .targetShelterId(request.targetShelterId())
                .resourceType(request.resourceType())
                .resourceName(request.resourceName())
                .unit(request.unit())
                .reservedQuantity(request.quantity())
                .referenceNumber(request.referenceNumber())
                .status(ReservationStatus.RESERVED)
                .build());
        eventPublisherService.publish("resource.reserved", Map.of(
                "reservationId", reservation.getId(),
                "batchId", reservation.getBatchId(),
                "referenceNumber", reservation.getReferenceNumber()
        ));
        return resourceMapper.toReservationResponse(reservation);
    }

    @Transactional
    public StockReservationResponse release(Long reservationId, String reason) {
        StockReservation reservation = getReservation(reservationId);
        if (reservation.getStatus() != ReservationStatus.RESERVED) {
            throw new ConflictException("Only reserved stock can be released");
        }

        ResourceBatch batch = getBatch(reservation.getBatchId());
        batch.setQuantityAvailable(batch.getQuantityAvailable() + reservation.getReservedQuantity());
        reservation.setStatus(ReservationStatus.RELEASED);
        reservation.setReleaseReason(reason);
        return resourceMapper.toReservationResponse(reservation);
    }

    @Transactional
    public StockReservationResponse confirmTransfer(TransferConfirmRequest request) {
        StockReservation reservation = getReservation(request.reservationId());
        if (reservation.getStatus() != ReservationStatus.RESERVED) {
            throw new ConflictException("Reservation is not available for confirmation");
        }
        if (!reservation.getTargetShelterId().equals(request.receivingShelterId())) {
            throw new ConflictException("Receiving shelter does not match reservation target");
        }

        ResourceBatch sourceBatch = getBatch(reservation.getBatchId());
        batchRepository.save(ResourceBatch.builder()
                .shelterId(request.receivingShelterId())
                .resourceType(sourceBatch.getResourceType())
                .resourceName(sourceBatch.getResourceName())
                .unit(sourceBatch.getUnit())
                .quantityReceived(reservation.getReservedQuantity())
                .quantityAvailable(reservation.getReservedQuantity())
                .expiryDate(sourceBatch.getExpiryDate())
                .sourceDonationRef(sourceBatch.getSourceDonationRef())
                .receivedAt(Instant.now())
                .build());

        reservation.setStatus(ReservationStatus.COMPLETED);
        eventPublisherService.publish("transfer.completed", Map.of(
                "reservationId", reservation.getId(),
                "sourceShelterId", reservation.getSourceShelterId(),
                "targetShelterId", reservation.getTargetShelterId(),
                "donationRef", sourceBatch.getSourceDonationRef()
        ));
        return resourceMapper.toReservationResponse(reservation);
    }

    private StockReservation getReservation(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found"));
    }

    private ResourceBatch getBatch(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource batch not found"));
    }

    private String generateDonationReference() {
        String datePart = LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        String suffix = UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase(Locale.ROOT);
        return "DON-" + datePart + "-" + suffix;
    }
}
