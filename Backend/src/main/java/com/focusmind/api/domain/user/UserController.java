package com.focusmind.api.domain.user;

import com.focusmind.api.repositories.MetaRepository;
import com.focusmind.api.repositories.UserRepository;
import com.focusmind.api.services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private com.focusmind.api.services.EmailService emailService;

    @PostMapping("/cadastrar")
    public ResponseEntity<String> register(@RequestBody RegisterDTO data) {
        if (userRepository.existsByEmail(data.email())) {
            return ResponseEntity.badRequest().body("Erro: E-mail já está em uso!");
        }

        User newUser = new User();
        newUser.setName(data.name());
        newUser.setEmail(data.email());
        newUser.setPassword(data.password());
        newUser.setMateriaEstudo(data.materiaEstudo());
        newUser.setHorasDiaDisponiveis(data.horasDiaDisponiveis());
        newUser.setDataLimiteEstudo(data.dataLimiteEstudo());
        newUser.setTempoTotalEstudoHoras(data.tempoTotalEstudoHoras());

        User saved = userRepository.save(newUser);

        return ResponseEntity.ok(saved.getId().toString());
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO data) {
        var userOptional = userRepository.findByEmail(data.email());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(data.password())) {
                return ResponseEntity.ok(user.getId().toString());
            }
        }

        return ResponseEntity.status(401).body("E-mail ou senha inválidos!");
    }

    @GetMapping("/{id}/perfil")
    public ResponseEntity obterPerfil(@PathVariable Long id) {
        var userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        return ResponseEntity.ok(new PerfilDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getNivel(),
            user.getPontos(),
            user.getStreakDias(),
            user.getMateriaEstudo(),
            user.getHorasDiaDisponiveis(),
            user.getDataLimiteEstudo(),
            user.getTempoTotalEstudoHoras(),
            user.getBausDisponiveis()
        ));
    }

    @PostMapping("/{id}/gastar")
    public ResponseEntity gastarMoedas(@PathVariable Long id, @RequestBody GastarRequestDTO data) {
        var userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        if (user.getPontos() < data.preco()) {
            return ResponseEntity.badRequest().body("Saldo de pontos/moedas insuficiente!");
        }

        user.setPontos(user.getPontos() - data.preco());
        userRepository.save(user);

        return ResponseEntity.ok(new PerfilDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getNivel(),
            user.getPontos(),
            user.getStreakDias(),
            user.getMateriaEstudo(),
            user.getHorasDiaDisponiveis(),
            user.getDataLimiteEstudo(),
            user.getTempoTotalEstudoHoras(),
            user.getBausDisponiveis()
        ));
    }

    @PostMapping("/{id}/gerar-subtopicos")
    public ResponseEntity<SubTopicosResponseDTO> gerarSubTopicos(@PathVariable Long id) {
        var userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        if (user.getMateriaEstudo() == null || user.getMateriaEstudo().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String subtopicosJson = geminiService.gerarSubTopicos(
                user.getMateriaEstudo(),
                user.getHorasDiaDisponiveis() != null ? user.getHorasDiaDisponiveis() : 2,
                user.getDataLimiteEstudo() != null ? user.getDataLimiteEstudo() : LocalDate.now().plusMonths(1),
                user.getTempoTotalEstudoHoras() != null ? user.getTempoTotalEstudoHoras() : 40
            );
            return ResponseEntity.ok(new SubTopicosResponseDTO(subtopicosJson));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/alertas-email")
    public ResponseEntity toggleAlertasEmail(@PathVariable Long id, @RequestBody AlertaEmailDTO data) {
        return userRepository.findById(id).map(user -> {
            user.setAlertasEmailAtivo(data.ativo());
            userRepository.save(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/testar-email")
    public ResponseEntity testarEmail(@PathVariable Long id) {
        var userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        if (user.getMateriaEstudo() == null || user.getMateriaEstudo().isBlank()) {
            return ResponseEntity.badRequest().body("Usuário não tem matéria configurada para estudo!");
        }

        try {
            int diasRestantes = 30; // Mock temporário para teste
            if (user.getDataLimiteEstudo() != null) {
                diasRestantes = (int) java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), user.getDataLimiteEstudo());
            }

            int horasDia = user.getHorasDiaDisponiveis() != null ? user.getHorasDiaDisponiveis() : 2;

            String mensagemMotivacional = geminiService.gerarMensagemMotivaional(
                user.getName(),
                user.getMateriaEstudo(),
                diasRestantes,
                horasDia
            );

            emailService.enviarLembrete(
                user.getEmail(),
                user.getName(),
                user.getMateriaEstudo(),
                mensagemMotivacional
            );
            return ResponseEntity.ok("E-mail enviado com sucesso para: " + user.getEmail());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao enviar e-mail: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/registrar-acesso")
    public ResponseEntity registrarAcesso(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            LocalDate hoje = LocalDate.now();
            if (user.getUltimoAcesso() == null) {
                user.setStreakDias(1);
            } else if (user.getUltimoAcesso().isEqual(hoje.minusDays(1))) {
                user.setStreakDias((user.getStreakDias() == null ? 0 : user.getStreakDias()) + 1);
            } else if (user.getUltimoAcesso().isBefore(hoje.minusDays(1))) {
                user.setStreakDias(1); // Quebrou o streak
            }
            user.setUltimoAcesso(hoje);
            userRepository.save(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/abrir-bau")
    public ResponseEntity<Integer> abrirBau(@PathVariable Long id) {
        var userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        if (user.getBausDisponiveis() == null || user.getBausDisponiveis() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        user.setBausDisponiveis(user.getBausDisponiveis() - 1);
        
        // Gera entre 10 e 50 moedas
        int moedasPagas = 10 + (int)(Math.random() * ((50 - 10) + 1));
        user.setPontos((user.getPontos() == null ? 0 : user.getPontos()) + moedasPagas);
        
        userRepository.save(user);
        return ResponseEntity.ok(moedasPagas);
    }

    public record PerfilDTO(
        Long id, String name, String email, Long nivel, Integer pontos, Integer streakDias,
        String materiaEstudo, Integer horasDiaDisponiveis, LocalDate dataLimiteEstudo, Integer tempoTotalEstudoHoras,
        Integer bausDisponiveis
    ) {}
    public record GastarRequestDTO(Integer preco, String item) {}
    public record SubTopicosResponseDTO(String subtopicos) {}
    public record AlertaEmailDTO(Boolean ativo) {}
}
