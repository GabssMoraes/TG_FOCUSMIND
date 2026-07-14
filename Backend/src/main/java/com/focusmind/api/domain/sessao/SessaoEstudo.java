package com.focusmind.api.domain.sessao;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Table(name = "\"SESSAO_ESTUDO\"")
@Entity(name = "SESSAO_ESTUDO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class SessaoEstudo {

    @Id
    @Column(name = "\"ID_SESSAO\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Column(name = "\"DATA\"")
    private LocalDateTime data = LocalDateTime.now();

    @Column(name = "\"HORA_INICIO\"")
    private LocalTime horaInicio;

    @Column(name = "\"HORA_FIM\"")
    private LocalTime horaFim;

    @Column(name = "\"TEMPO_PLANEJADO\"")
    private LocalTime tempoPlanejado;

    @Column(name = "\"TEMPO_REAL\"")
    private LocalTime tempoReal;

    @Column(name = "\"FOI_CONCLUIDA\"")
    private Boolean foiConcluida = false;

    @Column(name = "\"NIVEL_FOCO\"")
    private Integer nivelFoco;

    @Column(name = "\"DISTRACOES_REPORTADAS\"", columnDefinition = "TEXT")
    private String distracoesReportadas;
}
