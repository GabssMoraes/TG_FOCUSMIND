package com.focusmind.api.repositories;

import com.focusmind.api.domain.recomendacao.RecomendacaoIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RecomendacaoIARepository extends JpaRepository<RecomendacaoIA, Long> {
    List<RecomendacaoIA> findByUserId(Long userId);
    List<RecomendacaoIA> findByUserIdAndTipoOrderByDtEnvioDesc(Long userId, String tipo);

    @Query(value = "SELECT COALESCE(MAX(\"ID_RECOMENDACAO\"), 0) FROM \"RECOMENDACOES_IA\"", nativeQuery = true)
    Long findMaxId();
}

