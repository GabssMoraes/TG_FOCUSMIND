package com.focusmind.api.repositories;

import com.focusmind.api.domain.meta.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MetaRepository extends JpaRepository<Meta, Long> {
    List<Meta> findByUserId(Long userId);
    List<Meta> findByUserIdAndStatus(Long userId, String status);

    @Query(value = "SELECT COALESCE(MAX(\"ID_METAS\"), 0) FROM \"METAS\"", nativeQuery = true)
    Long findMaxId();
}

