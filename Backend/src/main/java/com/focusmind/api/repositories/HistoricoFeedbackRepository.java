package com.focusmind.api.repositories;

import com.focusmind.api.domain.feedback.HistoricoFeedback;
import com.focusmind.api.domain.feedback.HistoricoFeedbackId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface HistoricoFeedbackRepository extends JpaRepository<HistoricoFeedback, HistoricoFeedbackId> {
    List<HistoricoFeedback> findByUserId(Long userId);
    
    @Query(value = "SELECT COALESCE(MAX(\"ID_FEEDBACK\"), 0) FROM \"HISTORICO_FEEDBACK\"", nativeQuery = true)
    Long findMaxId();
}
