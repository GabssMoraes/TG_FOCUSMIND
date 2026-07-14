package com.focusmind.api.controllers;

import com.focusmind.api.domain.meta.Meta;
import com.focusmind.api.domain.user.User;
import com.focusmind.api.repositories.MetaRepository;
import com.focusmind.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/metas")
@CrossOrigin(origins = "*")
public class MetaController {

    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Meta>> listar(@RequestParam Long userId) {
        List<Meta> metas = metaRepository.findByUserId(userId);
        return ResponseEntity.ok(metas);
    }

    @PostMapping
    public ResponseEntity criar(@RequestBody MetaRequestDTO data) {
        var userOptional = userRepository.findById(data.userId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        User user = userOptional.get();
        Meta meta = new Meta();
        meta.setId(metaRepository.findMaxId() + 1);
        meta.setUser(user);
        meta.setDescricao(data.descricao());
        meta.setDtInicio(data.dtInicio() != null ? LocalDateTime.parse(data.dtInicio()) : LocalDateTime.now());
        meta.setDtFim(data.dtFim() != null ? LocalDateTime.parse(data.dtFim()) : null);
        meta.setStatus("A"); // 'A' = Ativa
        meta.setProgressoPercentual(0);

        Meta saved = metaRepository.save(meta);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity concluir(@PathVariable Long id) {
        var metaOptional = metaRepository.findById(id);
        if (metaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Meta meta = metaOptional.get();
        if ("C".equals(meta.getStatus())) {
            return ResponseEntity.badRequest().body("Meta já concluída!");
        }

        meta.setStatus("C"); // 'C' = Concluída
        meta.setProgressoPercentual(100);
        meta.setDtFim(LocalDateTime.now());

        // Conquistar pontos! (+5 pontos/moedas)
        User user = meta.getUser();
        user.setPontos(user.getPontos() + 5);
        userRepository.save(user);

        metaRepository.save(meta);
        return ResponseEntity.ok(meta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        if (!metaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        metaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    public record MetaRequestDTO(Long userId, String descricao, String dtInicio, String dtFim) {}
}
