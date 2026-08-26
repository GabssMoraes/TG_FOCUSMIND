package com.focusmind.api.repositories;

import com.focusmind.api.domain.chat.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserIdOrderByDataCriacaoDesc(Long userId);
}
