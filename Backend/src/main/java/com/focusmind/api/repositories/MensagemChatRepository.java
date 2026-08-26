package com.focusmind.api.repositories;

import com.focusmind.api.domain.chat.MensagemChat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensagemChatRepository extends JpaRepository<MensagemChat, Long> {
    List<MensagemChat> findByUserIdOrderByDataHoraAsc(Long userId);
    List<MensagemChat> findBySessionIdOrderByDataHoraAsc(Long sessionId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);
}
