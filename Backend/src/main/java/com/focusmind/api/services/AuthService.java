package com.focusmind.api.services;

import com.focusmind.api.domain.user.LoginDTO;
import com.focusmind.api.domain.user.RegisterDTO;
import com.focusmind.api.domain.user.User;
import com.focusmind.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository repository;

    public User register(RegisterDTO data) throws Exception {
        if(repository.findByEmail(data.email()).isPresent()){
            throw new Exception("Email já está em uso!");
        }

        User newUser = new User();
        newUser.setName(data.name());
        newUser.setEmail(data.email());
        newUser.setPassword(data.password());
        
        return repository.save(newUser);
    }

    public User login(LoginDTO data) throws Exception {
        Optional<User> userOptional = repository.findByEmail(data.email());
        
        if(userOptional.isPresent()){
            User user = userOptional.get();
            if(user.getPassword().equals(data.password())){
                return user;
            }
        }
        throw new Exception("Usuário ou senha incorretos!");
    }
}
