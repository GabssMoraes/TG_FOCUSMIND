package com.focusmind.api.repositories;

import com.focusmind.api.domain.baseconhecimento.BaseConhecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BaseConhecimentoRepository extends JpaRepository<BaseConhecimento, Integer> {

    @Query(value = "SELECT id, titulo, conteudo FROM base_conhecimento ORDER BY embedding <=> CAST(:embedding AS vector) LIMIT :limit", nativeQuery = true)
    List<Object[]> findSimilarContent(@Param("embedding") String embeddingVectorString, @Param("limit") int limit);
}
