package com.focusmind.api.domain.user;

import com.focusmind.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/cadastrar")
    public ResponseEntity<String> register(@RequestBody RegisterDTO data) {
        if (userRepository.existsByEmail(data.email())) {
            return ResponseEntity.badRequest().body("Erro: E-mail já está em uso!");
        }

        User newUser = new User();
        newUser.setName(data.name());
        newUser.setEmail(data.email());
        newUser.setPassword(data.password());
        
        userRepository.save(newUser);
        
        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
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
            user.getStreakDias()
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
            user.getStreakDias()
        ));
    }

    public record PerfilDTO(Long id, String name, String email, Long nivel, Integer pontos, Integer streakDias) {}
    public record GastarRequestDTO(Integer preco, String item) {}
}
