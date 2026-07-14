package com.focusmind.api.controllers;

import com.focusmind.api.domain.sessao.SessaoEstudo;
import com.focusmind.api.domain.user.User;
import com.focusmind.api.domain.feedback.HistoricoFeedback;
import com.focusmind.api.repositories.SessaoEstudoRepository;
import com.focusmind.api.repositories.UserRepository;
import com.focusmind.api.repositories.HistoricoFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/sessoes")
@CrossOrigin(origins = "*")
public class SessaoEstudoController {

    @Autowired
    private SessaoEstudoRepository sessaoEstudoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoricoFeedbackRepository feedbackRepository;

    @GetMapping
    public ResponseEntity<List<SessaoEstudo>> listar(@RequestParam Long userId) {
        List<SessaoEstudo> sessoes = sessaoEstudoRepository.findByUserId(userId);
        return ResponseEntity.ok(sessoes);
    }

    @PostMapping
    public ResponseEntity criar(@RequestBody SessaoRequestDTO data) {
        var userOptional = userRepository.findById(data.userId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        User user = userOptional.get();

        SessaoEstudo sessao = new SessaoEstudo();
        sessao.setId(sessaoEstudoRepository.findMaxId() + 1);
        sessao.setUser(user);
        sessao.setData(data.data() != null ? LocalDateTime.parse(data.data()) : LocalDateTime.now());
        sessao.setHoraInicio(data.horaInicio() != null ? LocalTime.parse(data.horaInicio()) : LocalTime.now().minusMinutes(25));
        sessao.setHoraFim(data.horaFim() != null ? LocalTime.parse(data.horaFim()) : LocalTime.now());
        sessao.setTempoPlanejado(data.tempoPlanejado() != null ? LocalTime.parse(data.tempoPlanejado()) : LocalTime.of(0, 25, 0));
        sessao.setTempoReal(data.tempoReal() != null ? LocalTime.parse(data.tempoReal()) : LocalTime.of(0, 25, 0));
        sessao.setFoiConcluida(data.foiConcluida() != null ? data.foiConcluida() : false);
        sessao.setNivelFoco(data.nivelFoco());
        sessao.setDistracoesReportadas(data.distracoesReportadas());

        SessaoEstudo savedSessao = sessaoEstudoRepository.save(sessao);

        // Processamento de Gamificação e Streaks
        if (Boolean.TRUE.equals(savedSessao.getFoiConcluida())) {
            // 1. Dar pontos (+10 pontos por sessão concluída)
            user.setPontos(user.getPontos() + 10);

            // 2. Atualizar Streak (dias consecutivos)
            List<SessaoEstudo> sessoesAnteriores = sessaoEstudoRepository.findByUserId(user.getId());
            LocalDate hoje = LocalDate.now();
            LocalDate dataUltimaSessao = null;

            for (SessaoEstudo s : sessoesAnteriores) {
                if (s.getId().equals(savedSessao.getId())) continue;
                if (Boolean.TRUE.equals(s.getFoiConcluida())) {
                    LocalDate d = s.getData().toLocalDate();
                    if (dataUltimaSessao == null || d.isAfter(dataUltimaSessao)) {
                        dataUltimaSessao = d;
                    }
                }
            }

            if (dataUltimaSessao == null) {
                // Primeira sessão concluída
                user.setStreakDias(1);
            } else {
                if (dataUltimaSessao.equals(hoje)) {
                    // Já fez estudo hoje, mantém o streak atual
                } else if (dataUltimaSessao.equals(hoje.minusDays(1))) {
                    // Fez ontem, incrementa streak
                    user.setStreakDias(user.getStreakDias() + 1);
                } else {
                    // Quebrou a sequência, reinicia
                    user.setStreakDias(1);
                }
            }

            userRepository.save(user);
        }

        // Se houver feedback associado, salvar na tabela HISTORICO_FEEDBACK
        if (data.avaliacaoMotivacao() != null || data.comentario() != null) {
            HistoricoFeedback feedback = new HistoricoFeedback();
            feedback.setIdFeedback(feedbackRepository.findMaxId() + 1);
            feedback.setUser(user);
            feedback.setSessaoEstudo(savedSessao);
            feedback.setAvaliacaoMotivacao(data.avaliacaoMotivacao());
            feedback.setComentario(data.comentario());
            feedbackRepository.save(feedback);
        }

        return ResponseEntity.ok(savedSessao);
    }

    public record SessaoRequestDTO(
        Long userId,
        String data,
        String horaInicio,
        String horaFim,
        String tempoPlanejado,
        String tempoReal,
        Boolean foiConcluida,
        Integer nivelFoco,
        String distracoesReportadas,
        String avaliacaoMotivacao,
        String comentario
    ) {}
}
