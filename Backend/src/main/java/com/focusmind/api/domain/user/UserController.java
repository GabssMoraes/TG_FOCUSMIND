package com.focusmind.api.domain.user;

import com.focusmind.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Diz pro Spring que aqui teremos endpoints de API
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Importante: Permite as requisições do seu React (porta 5173/3000)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Rota para Cadastrar novo Usuário
    @PostMapping("/cadastrar")
    public ResponseEntity<String> register(@RequestBody RegisterDTO data) {
        // Validação: Checar se e-mail já existe
        if (userRepository.existsByEmail(data.email())) {
            return ResponseEntity.badRequest().body("Erro: E-mail já está em uso!");
        }

        // Criando a entidade e salvando
        User newUser = new User();
        newUser.setName(data.name());
        newUser.setEmail(data.email());
        newUser.setPassword(data.password());
        
        userRepository.save(newUser);
        
        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
    }

    // Rota para Fazer o Login
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO data) {
        var userOptional = userRepository.findByEmail(data.email());

        // Achei o email? A senha também está correta? (Em produção use senhas encriptadas Ex: BCrypt)
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(data.password())) {
                // Sucesso no login, retornamos o ID do usuário para o Frontend salvar no LocalStorage
                return ResponseEntity.ok(user.getId().toString());
            }
        }
        
        // Retorna status 401 Unauthorized se qualquer um estiver incorreto
        return ResponseEntity.status(401).body("E-mail ou senha inválidos!");
    }
}
