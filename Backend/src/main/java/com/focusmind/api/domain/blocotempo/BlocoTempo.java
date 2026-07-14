package com.focusmind.api.domain.blocotempo;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "\"BLOCOS_TEMPO\"")
@Entity(name = "BLOCOS_TEMPO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class BlocoTempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ID_BLOCO\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Column(name = "\"MATERIA\"", nullable = false)
    private String materia;

    @Column(name = "\"DIA_SEMANA\"", nullable = false)
    private String diaSemana; // Ex: "Segunda", "Terça", etc.

    @Column(name = "\"HORA_INICIO\"", nullable = false)
    private String horaInicio; // Ex: "08:00"

    @Column(name = "\"HORA_FIM\"", nullable = false)
    private String horaFim; // Ex: "09:00"
}
