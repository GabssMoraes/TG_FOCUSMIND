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

    @Autowired
    private com.focusmind.api.repositories.UserRepository userRepository;

    @GetMapping("/historico")
    public ResponseEntity<List<MensagemChat>> obterHistorico(@RequestParam Long userId) {
        List<MensagemChat> historico = mensagemChatRepository.findByUserIdOrderByDataHoraAsc(userId);
        return ResponseEntity.ok(historico);
    }

    @PostMapping("/perguntar")
    public ResponseEntity<ChatResponseDTO> perguntar(@RequestBody ChatRequestDTO data) {
        Boolean salvar = data.salvarNoHistorico() == null ? true : data.salvarNoHistorico();
        String resposta = geminiService.gerarRespostaComRAG(data.mensagem(), data.userId(), salvar);
        return ResponseEntity.ok(new ChatResponseDTO(resposta));
    }

    @GetMapping("/gerar-quiz")
    public ResponseEntity<String> gerarQuiz(@RequestParam Long userId) {
        try {
            var userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            String materia = userOptional.get().getMateriaEstudo();
            if (materia == null || materia.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuário não tem matéria configurada.");
            }
            String jsonQuiz = geminiService.gerarQuiz(materia);
            return ResponseEntity.ok(jsonQuiz);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao gerar quiz: " + e.getMessage());
        }
    }

    @GetMapping("/gerar-quiz-meta")
    public ResponseEntity<String> gerarQuizMeta(@RequestParam String descricao) {
        try {
            if (descricao == null || descricao.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Descrição da meta não pode ser vazia.");
            }
            String jsonQuiz = geminiService.gerarQuizMeta(descricao);
            return ResponseEntity.ok(jsonQuiz);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao gerar quiz da meta: " + e.getMessage());
        }
    }

    public record ChatRequestDTO(String mensagem, Long userId, Boolean salvarNoHistorico) {}
    public record ChatResponseDTO(String resposta) {}
}
