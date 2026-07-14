package com.focusmind.api.controllers;

import com.focusmind.api.domain.revisao.RevisaoSemanal;
import com.focusmind.api.domain.user.User;
import com.focusmind.api.repositories.RevisaoSemanalRepository;
import com.focusmind.api.repositories.UserRepository;
import com.focusmind.api.services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/revisoes")
@CrossOrigin(origins = "*")
public class RevisaoSemanalController {

    @Autowired
    private RevisaoSemanalRepository revisaoSemanalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    @GetMapping
    public ResponseEntity<List<RevisaoSemanal>> listar(@RequestParam Long userId) {
        List<RevisaoSemanal> revisoes = revisaoSemanalRepository.findByUserIdOrderByDataRegistroDesc(userId);
        return ResponseEntity.ok(revisoes);
    }

    @PostMapping
    public ResponseEntity criar(@RequestBody RevisaoRequestDTO data) {
        var userOptional = userRepository.findById(data.userId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        User user = userOptional.get();

        // Chamar Gemini para gerar as recomendações/resumo da revisão
        String resumoIA;
        try {
            resumoIA = geminiService.gerarResumoRevisaoSemanal(
                data.oQueFoiBem(),
                data.oQueNaoSaiuComoPlanejado(),
                data.oQueAjustar()
            );
        } catch (Exception e) {
            resumoIA = "Não foi possível gerar a análise automática da IA no momento: " + e.getMessage();
        }

        RevisaoSemanal revisao = new RevisaoSemanal();
        revisao.setUser(user);
        revisao.setOQueFoiBem(data.oQueFoiBem());
        revisao.setOQueNaoSaiuComoPlanejado(data.oQueNaoSaiuComoPlanejado());
        revisao.setOQueAjustar(data.oQueAjustar());
        revisao.setResumoIA(resumoIA);

        RevisaoSemanal saved = revisaoSemanalRepository.save(revisao);

        // Dar moedas/pontos (+30 pontos por preencher a revisão semanal!)
        user.setPontos(user.getPontos() + 30);
        userRepository.save(user);

        return ResponseEntity.ok(saved);
    }

    public record RevisaoRequestDTO(
        Long userId,
        String oQueFoiBem,
        String oQueNaoSaiuComoPlanejado,
        String oQueAjustar
    ) {}
}
