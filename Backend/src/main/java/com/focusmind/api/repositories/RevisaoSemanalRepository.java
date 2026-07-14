package com.focusmind.api.repositories;

import com.focusmind.api.domain.revisao.RevisaoSemanal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RevisaoSemanalRepository extends JpaRepository<RevisaoSemanal, Long> {
    List<RevisaoSemanal> findByUserIdOrderByDataRegistroDesc(Long userId);
}
