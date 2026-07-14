package com.focusmind.api.repositories;

import com.focusmind.api.domain.chat.MensagemChat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensagemChatRepository extends JpaRepository<MensagemChat, Long> {
    List<MensagemChat> findByUserIdOrderByDataHoraAsc(Long userId);
}
