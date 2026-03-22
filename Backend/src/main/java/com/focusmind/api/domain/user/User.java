package com.focusmind.api.domain.user;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "\"USUARIOS\"")
@Entity(name = "USUARIOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ID_USUARIO\"")
    private Long id;

    @Column(name = "\"NOME\"", nullable = false)
    private String name;

    @Column(name = "\"EMAIL\"", nullable = false, unique = true)
    private String email;

    @Column(name = "\"SENHA\"", nullable = false)
    private String password;
}
