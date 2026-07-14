package com.focusmind.api.domain.meta;

import com.focusmind.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Table(name = "\"METAS\"")
@Entity(name = "METAS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Meta {

    @Id
    @Column(name = "\"ID_METAS\"")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "\"FK_ID_USUARIO\"")
    private User user;

    @Column(name = "\"DESCRICAO\"", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "\"DT_INICIO\"")
    private LocalDateTime dtInicio;

    @Column(name = "\"DT_FIM\"")
    private LocalDateTime dtFim;

    @Column(name = "\"STATUS\"")
    private String status; // 'A' = Ativa, 'C' = Concluída, etc.

    @Column(name = "\"PROGRESSO_PERCENTUAL\"")
    private Integer progressoPercentual = 0;
}
