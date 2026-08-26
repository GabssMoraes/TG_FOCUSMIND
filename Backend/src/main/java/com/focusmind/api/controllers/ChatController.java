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

    @Autowired
    private com.focusmind.api.repositories.ChatSessionRepository chatSessionRepository;

    @GetMapping("/sessoes")
    public ResponseEntity<List<com.focusmind.api.domain.chat.ChatSession>> obterSessoes(@RequestParam Long userId) {
        return ResponseEntity.ok(chatSessionRepository.findByUserIdOrderByDataCriacaoDesc(userId));
    }

    @GetMapping("/historico")
    public ResponseEntity<List<MensagemChat>> obterHistorico(@RequestParam Long sessionId) {
        List<MensagemChat> historico = mensagemChatRepository.findBySessionIdOrderByDataHoraAsc(sessionId);
        return ResponseEntity.ok(historico);
    }

    @DeleteMapping("/sessoes/{id}")
    public ResponseEntity<String> deletarSessao(@PathVariable Long id) {
        try {
            chatSessionRepository.deleteById(id);
            return ResponseEntity.ok("Sessão deletada com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao deletar sessão: " + e.getMessage());
        }
    }

    @PostMapping("/perguntar")
    public ResponseEntity<ChatResponseDTO> perguntar(@RequestBody ChatRequestDTO data) {
        Boolean salvar = data.salvarNoHistorico() == null ? true : data.salvarNoHistorico();
        Long sessionId = data.sessionId();
        
        if (salvar && sessionId == null && data.userId() != null) {
            // Cria nova sessão se não existir
            var user = userRepository.findById(data.userId()).orElse(null);
            if (user != null) {
                com.focusmind.api.domain.chat.ChatSession novaSessao = new com.focusmind.api.domain.chat.ChatSession();
                novaSessao.setUser(user);
                
                // Título simples para a primeira mensagem
                String titulo = data.mensagem().length() > 30 
                    ? data.mensagem().substring(0, 30) + "..." 
                    : data.mensagem();
                novaSessao.setTitulo(titulo);
                
                novaSessao = chatSessionRepository.save(novaSessao);
                sessionId = novaSessao.getId();
            }
        }
        
        String resposta = geminiService.gerarRespostaComRAG(data.mensagem(), data.userId(), sessionId, salvar);
        return ResponseEntity.ok(new ChatResponseDTO(resposta, sessionId));
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

    public record ChatRequestDTO(String mensagem, Long userId, Long sessionId, Boolean salvarNoHistorico) {}
    public record ChatResponseDTO(String resposta, Long sessionId) {}
}
