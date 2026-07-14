package com.focusmind.api.domain.feedback;

import com.focusmind.api.domain.user.User;
import com.focusmind.api.domain.sessao.SessaoEstudo;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "\"HISTORICO_FEEDBACK\"")
@Entity(name = "HISTORICO_FEEDBACK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"idFeedback", "user", "sessaoEstudo"})
@IdClass(HistoricoFeedbackId.class)
public class HistoricoFeedback {

    @Id
    @Column(name = "\"ID_FEEDBACK\"")
    private Long idFeedback;

    @Id
    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "\"FK_ID_SESSAO\"")
    private SessaoEstudo sessaoEstudo;

    @Column(name = "\"AVALIACAO_MOTIVACAO\"", columnDefinition = "TEXT")
    private String avaliacaoMotivacao;

    @Column(name = "\"COMENTARIO\"", columnDefinition = "TEXT")
    private String comentario;
}
