package com.focusmind.api.domain.recomendacao;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Table(name = "\"RECOMENDACOES_IA\"")
@Entity(name = "RECOMENDACOES_IA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class RecomendacaoIA {

    @Id
    @Column(name = "\"ID_RECOMENDACAO\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Column(name = "\"TIPO\"")
    private String tipo; // Ex: "DIARIO", "SEMANAL", "CHAT"

    @Column(name = "\"DT_ENVIO\"")
    private LocalDateTime dtEnvio = LocalDateTime.now();

    @Column(name = "\"FOI_SEGUIDA\"")
    private Boolean foiSeguida = false;

    @Column(name = "\"FEEDBACK_USER\"", columnDefinition = "TEXT")
    private String feedbackUser; // Armazena a recomendação textual ou feedback do usuário
}
