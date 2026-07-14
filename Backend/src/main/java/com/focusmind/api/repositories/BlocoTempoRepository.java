package com.focusmind.api.repositories;

import com.focusmind.api.domain.blocotempo.BlocoTempo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BlocoTempoRepository extends JpaRepository<BlocoTempo, Long> {
    List<BlocoTempo> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
