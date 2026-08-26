package com.focusmind.api.domain.chat;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Table(name = "\"MENSAGENS_CHAT\"")
@Entity(name = "MENSAGENS_CHAT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class MensagemChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ID_MENSAGEM\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_SESSION\"")
    private ChatSession session;

    @Column(name = "\"SENDER\"", nullable = false)
    private String sender; // "user" ou "ai"

    @Column(name = "\"TEXTO\"", columnDefinition = "TEXT", nullable = false)
    private String texto;

    @Column(name = "\"DATA_HORA\"", nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();
}
