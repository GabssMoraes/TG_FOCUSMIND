package com.focusmind.api.controllers;

import com.focusmind.api.domain.chat.MensagemChat;
import com.focusmind.api.repositories.MensagemChatRepository;
import com.focusmind.api.services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private MensagemChatRepository mensagemChatRepository;

    @GetMapping("/historico")
    public ResponseEntity<List<MensagemChat>> obterHistorico(@RequestParam Long userId) {
        List<MensagemChat> historico = mensagemChatRepository.findByUserIdOrderByDataHoraAsc(userId);
        return ResponseEntity.ok(historico);
    }

    @PostMapping("/perguntar")
    public ResponseEntity<ChatResponseDTO> perguntar(@RequestBody ChatRequestDTO data) {
        String resposta = geminiService.gerarRespostaComRAG(data.mensagem(), data.userId());
        return ResponseEntity.ok(new ChatResponseDTO(resposta));
    }

    public record ChatRequestDTO(String mensagem, Long userId) {}
    public record ChatResponseDTO(String resposta) {}
}
