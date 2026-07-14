package com.focusmind.api.repositories;

import com.focusmind.api.domain.sessao.SessaoEstudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SessaoEstudoRepository extends JpaRepository<SessaoEstudo, Long> {
    List<SessaoEstudo> findByUserId(Long userId);

    @Query(value = "SELECT COALESCE(MAX(\"ID_SESSAO\"), 0) FROM \"SESSAO_ESTUDO\"", nativeQuery = true)
    Long findMaxId();
}

