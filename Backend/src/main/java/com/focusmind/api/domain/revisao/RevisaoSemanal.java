package com.focusmind.api.domain.revisao;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Table(name = "\"REVISOES_SEMANAIS\"")
@Entity(name = "REVISOES_SEMANAIS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class RevisaoSemanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ID_REVISAO\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Column(name = "\"O_QUE_FOI_BEM\"", columnDefinition = "TEXT", nullable = false)
    private String oQueFoiBem;

    @Column(name = "\"O_QUE_NAO_SAIU_COMO_PLANEJADO\"", columnDefinition = "TEXT", nullable = false)
    private String oQueNaoSaiuComoPlanejado;

    @Column(name = "\"O_QUE_AJUSTAR\"", columnDefinition = "TEXT", nullable = false)
    private String oQueAjustar;

    @Column(name = "\"RESUMO_IA\"", columnDefinition = "TEXT")
    private String resumoIA;

    @Column(name = "\"DATA_REGISTRO\"", nullable = false)
    private LocalDateTime dataRegistro = LocalDateTime.now();
}
