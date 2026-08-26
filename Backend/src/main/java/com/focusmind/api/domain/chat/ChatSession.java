package com.focusmind.api.domain.chat;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Table(name = "\"SESSOES_CHAT\"")
@Entity(name = "SESSOES_CHAT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ID_SESSION\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Column(name = "\"TITULO\"")
    private String titulo;

    @Column(name = "\"DATA_CRIACAO\"", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();
}
