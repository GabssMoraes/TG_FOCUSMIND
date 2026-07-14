package com.focusmind.api.controllers;

import com.focusmind.api.domain.blocotempo.BlocoTempo;
import com.focusmind.api.domain.meta.Meta;
import com.focusmind.api.domain.user.User;
import com.focusmind.api.repositories.BlocoTempoRepository;
import com.focusmind.api.repositories.MetaRepository;
import com.focusmind.api.repositories.UserRepository;
import com.focusmind.api.services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timeblocking")
@CrossOrigin(origins = "*")
public class TimeBlockingController {

    @Autowired
    private BlocoTempoRepository blocoTempoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private GeminiService geminiService;

    @GetMapping
    public ResponseEntity<List<BlocoTempo>> listar(@RequestParam Long userId) {
        List<BlocoTempo> blocos = blocoTempoRepository.findByUserId(userId);
        return ResponseEntity.ok(blocos);
    }

    @PostMapping
    @Transactional
    public ResponseEntity salvarTodos(@RequestParam Long userId, @RequestBody List<BlocoRequestDTO> data) {
        var userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        User user = userOptional.get();

        // Limpar blocos antigos
        blocoTempoRepository.deleteByUserId(userId);

        // Salvar novos blocos
        List<BlocoTempo> blocosSalvos = new ArrayList<>();
        for (BlocoRequestDTO item : data) {
            BlocoTempo bt = new BlocoTempo();
            bt.setUser(user);
            bt.setMateria(item.materia());
            bt.setDiaSemana(item.diaSemana());
            bt.setHoraInicio(item.horaInicio());
            bt.setHoraFim(item.horaFim());
            blocosSalvos.add(blocoTempoRepository.save(bt));
        }

        return ResponseEntity.ok(blocosSalvos);
    }

    @GetMapping("/sugerir")
    public ResponseEntity sugerirGrade(@RequestParam Long userId) {
        var userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        // Puxar metas ativas do usuário
        List<Meta> activeMetas = metaRepository.findByUserIdAndStatus(userId, "A");
        String metasString;
        if (activeMetas.isEmpty()) {
            metasString = "- Nenhuma tarefa pendente cadastrada pelo usuário no momento (crie um plano padrão para a semana).";
        } else {
            metasString = activeMetas.stream()
                    .map(Meta::getDescricao)
                    .map(desc -> "- " + desc)
                    .collect(Collectors.joining("\n"));
        }

        try {
            String sugestao = geminiService.sugerirGradeTimeBlocking(metasString);
            return ResponseEntity.ok(new SugestaoResponseDTO(sugestao));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao obter sugestão da IA: " + e.getMessage());
        }
    }

    public record BlocoRequestDTO(String materia, String diaSemana, String horaInicio, String horaFim) {}
    public record SugestaoResponseDTO(String sugestao) {}
}
