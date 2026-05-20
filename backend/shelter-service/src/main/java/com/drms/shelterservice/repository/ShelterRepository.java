package com.drms.shelterservice.repository;

import com.drms.shelterservice.entity.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShelterRepository extends JpaRepository<Shelter, Long> {
}
